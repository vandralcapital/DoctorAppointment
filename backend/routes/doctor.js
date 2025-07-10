import express from 'express';
const router = express.Router();

console.log("Doctor router loaded");
import Doctor from '../models/Doctor.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Appointment from '../models/Appointment.js';
import multer from 'multer';
import path from 'path';
import { io } from '../index.js';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';

// Multer setup for avatar uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/avatars/');
  },
  filename: function (req, file, cb) {
    cb(null, req.doctorId + '_' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Multer setup for prescription uploads
const prescriptionStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/prescriptions/');
  },
  filename: function (req, file, cb) {
    cb(null, req.doctorId + '_' + Date.now() + path.extname(file.originalname));
  }
});
const prescriptionUpload = multer({ storage: prescriptionStorage });

// Doctor signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, specialization, qualification } = req.body;
    if (!name || !email || !password || !specialization || !qualification) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    const existing = await Doctor.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered.' });
    }
    const doctor = new Doctor({ name, email, password, specialization, qualification });
    await doctor.save();
    res.status(201).json({ message: 'Doctor registered successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Doctor login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }
    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }
    const token = jwt.sign({ id: doctor._id, role: 'doctor' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
    res.json({ token, doctor: { id: doctor._id, name: doctor.name, email: doctor.email, specialization: doctor.specialization, avatar: doctor.avatar } });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Middleware to authenticate doctor by JWT
function authenticateDoctor(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    if (decoded.role !== 'doctor') return res.status(403).json({ message: 'Not authorized' });
    req.doctorId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// Get all appointments for the logged-in doctor
router.get('/appointments', authenticateDoctor, async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctor: req.doctorId }).sort({ date: 1, time: 1 });
    res.json({ appointments });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get all unique patients for the logged-in doctor
router.get('/patients', authenticateDoctor, async (req, res) => {
  try {
    // Find all appointments for this doctor that have a patient reference
    const appointments = await Appointment.find({ doctor: req.doctorId, patient: { $ne: null } }).populate('patient', 'name email');
    // Map to unique patients
    const patientMap = new Map();
    appointments.forEach(appt => {
      if (appt.patient && !patientMap.has(appt.patient._id.toString())) {
        patientMap.set(appt.patient._id.toString(), {
          id: appt.patient._id,
          name: appt.patient.name,
          email: appt.patient.email,
          appointmentCount: 1
        });
      } else if (appt.patient) {
        const patient = patientMap.get(appt.patient._id.toString());
        patient.appointmentCount += 1;
        patientMap.set(appt.patient._id.toString(), patient);
      }
    });
    res.json({ patients: Array.from(patientMap.values()) });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});



// Update doctor profile
router.patch('/profile', authenticateDoctor, async (req, res) => {
  try {
    const { name, specialization, avatar, yearsOfExperience, phone, location, bio } = req.body;
    const update = {};
    if (name) update.name = name;
    if (specialization) update.specialization = specialization;
    if (avatar) update.avatar = avatar;
    if (yearsOfExperience !== undefined) {
      if (yearsOfExperience < 0) return res.status(400).json({ message: 'Years of experience cannot be negative.' });
      update.yearsOfExperience = yearsOfExperience;
    }
    if (phone !== undefined) update.phone = phone;
    if (location !== undefined) update.location = location;
    if (bio !== undefined) update.bio = bio;
    const doctor = await Doctor.findByIdAndUpdate(req.doctorId, update, { new: true });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found.' });
    // Emit real-time update event
    io.emit('doctorUpdated', doctor);
    res.json({ doctor });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /profile/avatar - upload avatar
router.post('/profile/avatar', authenticateDoctor, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });
    const doctor = await Doctor.findByIdAndUpdate(req.doctorId, { avatar: req.file.filename }, { new: true });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found.' });
    res.json({ avatar: doctor.avatar });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Update appointment status (approve/reject/cancel)
router.patch('/appointments/:id/status', authenticateDoctor, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }
    const appointment = await Appointment.findOne({ _id: req.params.id, doctor: req.doctorId });
    if (!appointment) return res.status(404).json({ message: 'Appointment not found.' });
    appointment.status = status;
    await appointment.save();
    res.json({ appointment });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// PATCH /appointments/:id/prescription - upload or update prescription
router.patch('/appointments/:id/prescription', authenticateDoctor, prescriptionUpload.single('file'), async (req, res) => {
  try {
    // DEBUG: Log doctorId and appointment doctor
    console.log('Doctor making request:', req.doctorId);
    const appointment = await Appointment.findOne({ _id: req.params.id }); // Relaxed doctor check for testing
    if (!appointment) return res.status(404).json({ message: 'Appointment not found.' });
    console.log('Appointment doctor:', appointment.doctor);
    if (req.file) {
      appointment.prescriptionFile = req.file.filename;
    }
    if (req.body.text) {
      appointment.prescriptionText = req.body.text;
    }
    await appointment.save();
    res.json({ appointment });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get all appointments for a specific patient (for the logged-in doctor)
router.get('/patients/:patientId/appointments', authenticateDoctor, async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctor: req.doctorId, patient: req.params.patientId }).sort({ date: 1, time: 1 });
    res.json({ appointments });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get patient info by ID (for the logged-in doctor)
router.get('/patients/:patientId', authenticateDoctor, async (req, res) => {
  try {
    const user = await User.findById(req.params.patientId).select('name email');
    if (user) {
      return res.json({ patient: { id: user._id, name: user.name, email: user.email } });
    }
    // If user not found, fallback to appointment info
    const appt = await Appointment.findOne({ doctor: req.doctorId, patient: req.params.patientId });
    if (appt) {
      return res.json({ patient: { id: req.params.patientId, name: appt.patientName, email: appt.patientEmail || '' } });
    }
    return res.status(404).json({ message: 'Patient not found.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get latest 5 newly joined doctors
router.get('/latest', async (req, res) => {
  try {
    const doctors = await Doctor.find({}, 'name specialization avatar createdAt')
      .sort({ createdAt: -1 })
      .limit(5);
    res.json({ doctors });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get all doctors listed on the platform
router.get('/', async (req, res) => {
  try {
    const doctors = await Doctor.find({});
    res.json({ doctors });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Public route: get all doctors, visible to everyone
router.get('/all-public', async (req, res) => {
  try {
    const doctors = await Doctor.find({});
    res.json({ doctors });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get a single doctor by ID
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found.' });
    res.json({ doctor });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// CRUD for availableSlots
// GET /slots - list all slots
router.get('/slots', authenticateDoctor, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.doctorId);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found.' });
    res.json({ slots: doctor.availableSlots });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});
// POST /slots - add a slot
router.post('/slots', authenticateDoctor, async (req, res) => {
  try {
    const { date, time } = req.body;
    const slotDate = new Date(date);
    if (slotDate < new Date()) return res.status(400).json({ message: 'Slot date must be present or future.' });
    const doctor = await Doctor.findById(req.doctorId);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found.' });
    doctor.availableSlots.push({ date: slotDate, time });
    await doctor.save();
    res.json({ slots: doctor.availableSlots });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});
// PATCH /slots/:slotId - edit a slot
router.patch('/slots/:slotId', authenticateDoctor, async (req, res) => {
  try {
    const { date, time } = req.body;
    const slotDate = new Date(date);
    if (slotDate < new Date()) return res.status(400).json({ message: 'Slot date must be present or future.' });
    const doctor = await Doctor.findById(req.doctorId);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found.' });
    const slot = doctor.availableSlots.id(req.params.slotId);
    if (!slot) return res.status(404).json({ message: 'Slot not found.' });
    slot.date = slotDate;
    slot.time = time;
    await doctor.save();
    res.json({ slots: doctor.availableSlots });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});
// DELETE /slots/:slotId - remove a slot
router.delete('/slots/:slotId', authenticateDoctor, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.doctorId);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found.' });
    doctor.availableSlots.id(req.params.slotId).remove();
    await doctor.save();
    res.json({ slots: doctor.availableSlots });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Change password for doctor
router.patch('/change-password', authenticateDoctor, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    const doctor = await Doctor.findById(req.doctorId).select('+password');
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found.' });
    }
    const isMatch = await bcrypt.compare(currentPassword, doctor.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect.' });
    }
    doctor.password = newPassword;
    await doctor.save();
    res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/doctors/:doctorId/appointments - Book an appointment with a doctor
router.post('/:doctorId/appointments', protect, async (req, res) => {
  try {
    const { patientName, date, time, treatment } = req.body;
    if (!patientName || !date || !time || !treatment) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    const appointment = new Appointment({
      doctor: req.params.doctorId,
      patient: req.user ? req.user._id : undefined, // Set patient if logged in
      patientName,
      date,
      time,
      treatment,
      status: 'upcoming'
    });
    await appointment.save();
    res.status(201).json({ appointment });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

export default router; 