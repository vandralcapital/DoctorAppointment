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
    const {
      name,
      email,
      password,
      specialization,
      qualification,
      hospitalName,
      department,
      contactNumber,
      addressLine1,
      addressLine2,
      city,
      state,
      district,
      pinCode,
      experience
    } = req.body;
    if (!name || !email || !password || !specialization || !qualification) {
      return res.status(400).json({ message: 'All required fields must be filled.' });
    }
    const existing = await Doctor.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered.' });
    }
    const doctor = new Doctor({
      name,
      email,
      password,
      specialization,
      qualification,
      hospitalName: hospitalName || '',
      department: department || '',
      phone: contactNumber || '',
      yearsOfExperience: experience || 0,
      address: {
        line1: addressLine1 || '',
        line2: addressLine2 || '',
        city: city || '',
        state: state || '',
        district: district || '',
        pinCode: pinCode || ''
      }
    });
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
    const {
      specialization,
      avatar,
      yearsOfExperience,
      phone,
      location,
      locationLink,
      bio,
      hospitalName,
      department,
      qualification,
      address,
    } = req.body;
    const update = {};
    if (specialization !== undefined) update.specialization = specialization;
    if (avatar !== undefined) update.avatar = avatar;
    if (yearsOfExperience !== undefined) {
      if (yearsOfExperience < 0) return res.status(400).json({ message: 'Years of experience cannot be negative.' });
      update.yearsOfExperience = yearsOfExperience;
    }
    if (phone !== undefined) update.phone = phone;
    if (location !== undefined) update.location = location;
    if (locationLink !== undefined) update.locationLink = locationLink;
    if (bio !== undefined) update.bio = bio;
    if (hospitalName !== undefined) update.hospitalName = hospitalName;
    if (department !== undefined) update.department = department;
    if (qualification !== undefined) update.qualification = qualification;
    if (address !== undefined) {
      update.address = {
        line1: address.line1 || '',
        line2: address.line2 || '',
        city: address.city || '',
        state: address.state || '',
        district: address.district || '',
        pinCode: address.pinCode || ''
      };
    }
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

// Get all appointments for a specific doctor by ID (for public or cross-doctor access)
router.get('/:id/appointments', async (req, res) => {
  try {
    const doctorId = req.params.id;
    const appointments = await Appointment.find({ doctor: doctorId }).sort({ date: 1, time: 1 });
    res.json({ appointments });
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

// POST /api/doctors/:doctorId/appointments - Book an appointment with a doctor (protected, supports both patient and anonymous)
router.post('/:doctorId/appointments', protect, async (req, res) => {
  try {
    const { patientName, date, time, treatment } = req.body;
    if (!patientName || !date || !time || !treatment) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    
    const appointment = new Appointment({
      doctor: req.params.doctorId,
      patient: req.user ? req.user._id : undefined, // Set patient if logged in
      patientName,
      date,
      time,
      treatment,
      status: 'upcoming',
      otp,
      otpExpires,
      treatmentState: 'pending'
    });
    await appointment.save();
    res.status(201).json({ appointment, otp });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/doctors/appointments/:id/verify-otp - Verify OTP for appointment
router.post('/appointments/:id/verify-otp', authenticateDoctor, async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp) {
      return res.status(400).json({ message: 'OTP is required.' });
    }
    
    const appointment = await Appointment.findOne({ _id: req.params.id, doctor: req.doctorId });
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }
    
    if (appointment.otpVerified) {
      return res.status(400).json({ message: 'OTP already verified for this appointment.' });
    }
    
    if (new Date() > appointment.otpExpires) {
      return res.status(400).json({ message: 'OTP has expired.' });
    }
    
    if (appointment.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP.' });
    }
    
    appointment.otpVerified = true;
    appointment.treatmentState = 'verified';
    await appointment.save();
    
    res.json({ 
      message: 'OTP verified successfully.',
      appointment 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// PATCH /api/doctors/appointments/:id/treatment-state - Update treatment state
router.patch('/appointments/:id/treatment-state', authenticateDoctor, async (req, res) => {
  try {
    const { treatmentState, doctorNotes } = req.body;
    if (!treatmentState || !['pending', 'verified', 'treated', 'no-show'].includes(treatmentState)) {
      return res.status(400).json({ message: 'Valid treatment state is required.' });
    }
    
    const appointment = await Appointment.findOne({ _id: req.params.id, doctor: req.doctorId });
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }
    
    appointment.treatmentState = treatmentState;
    if (doctorNotes) {
      appointment.doctorNotes = doctorNotes;
    }
    
    await appointment.save();
    
    res.json({ 
      message: 'Treatment state updated successfully.',
      appointment 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/doctors/appointments/:id/review - Add patient review
router.post('/appointments/:id/review', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 10) {
      return res.status(400).json({ message: 'Valid rating (1-10) is required.' });
    }
    
    const appointment = await Appointment.findOne({ _id: req.params.id, patient: req.user._id });
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }
    
    if (appointment.treatmentState !== 'treated') {
      return res.status(400).json({ message: 'Can only review appointments that have been treated.' });
    }
    
    if (appointment.review && appointment.review.rating) {
      return res.status(400).json({ message: 'Review already exists for this appointment.' });
    }
    
    appointment.review = {
      rating,
      comment: comment || '',
      createdAt: new Date()
    };
    
    await appointment.save();
    
    res.json({ 
      message: 'Review submitted successfully.',
      appointment 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/doctors/appointments/:id - Get appointment details with OTP
router.get('/appointments/:id', authenticateDoctor, async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ _id: req.params.id, doctor: req.doctorId })
      .populate('patient', 'name email')
      .populate('doctor', 'name specialization');
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }
    
    res.json({ appointment });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// ===== PROFILE DRAFT → PREVIEW → PUBLISH ROUTES =====

// GET /api/doctors/:id/draft - Get doctor's draft profile
router.get('/:id/draft', authenticateDoctor, async (req, res) => {
  try {
    // Ensure doctor can only access their own draft
    if (req.params.id !== req.doctorId) {
      return res.status(403).json({ message: 'Not authorized to access this draft.' });
    }
    
    const doctor = await Doctor.findById(req.doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found.' });
    }
    
    // Initialize draft profile with current profile data if empty
    if (!doctor.draftProfile.name) {
      doctor.draftProfile = {
        name: doctor.name,
        specialization: doctor.specialization,
        qualification: doctor.qualification,
        avatar: doctor.avatar,
        phone: doctor.phone,
        location: doctor.location,
        locationLink: doctor.locationLink,
        bio: doctor.bio,
        yearsOfExperience: doctor.yearsOfExperience,
        education: [],
        certifications: [],
        languages: [],
        consultationFee: 0,
        consultationDuration: 30,
        specialties: [],
        experience: [],
        achievements: [],
        publications: [],
        socialLinks: {
          linkedin: '',
          twitter: '',
          website: ''
        },
        lastUpdated: new Date()
      };
      await doctor.save();
    }
    
    res.json({ draftProfile: doctor.draftProfile });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/doctors/:id/draft - Update doctor's draft profile
router.put('/:id/draft', authenticateDoctor, async (req, res) => {
  try {
    // Ensure doctor can only update their own draft
    if (req.params.id !== req.doctorId) {
      return res.status(403).json({ message: 'Not authorized to update this draft.' });
    }
    
    const doctor = await Doctor.findById(req.doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found.' });
    }
    
    const {
      name, specialization, qualification, avatar, phone, location, locationLink,
      bio, yearsOfExperience, education, certifications, languages, consultationFee,
      consultationDuration, specialties, experience, achievements, publications, socialLinks
    } = req.body;
    
    // Update draft profile
    doctor.draftProfile = {
      name: name || doctor.draftProfile.name,
      specialization: specialization || doctor.draftProfile.specialization,
      qualification: qualification || doctor.draftProfile.qualification,
      avatar: avatar || doctor.draftProfile.avatar,
      phone: phone || doctor.draftProfile.phone,
      location: location || doctor.draftProfile.location,
      locationLink: locationLink || doctor.draftProfile.locationLink,
      bio: bio || doctor.draftProfile.bio,
      yearsOfExperience: yearsOfExperience !== undefined ? yearsOfExperience : doctor.draftProfile.yearsOfExperience,
      education: education || doctor.draftProfile.education || [],
      certifications: certifications || doctor.draftProfile.certifications || [],
      languages: languages || doctor.draftProfile.languages || [],
      consultationFee: consultationFee !== undefined ? consultationFee : doctor.draftProfile.consultationFee,
      consultationDuration: consultationDuration || doctor.draftProfile.consultationDuration || 30,
      specialties: specialties || doctor.draftProfile.specialties || [],
      experience: experience || doctor.draftProfile.experience || [],
      achievements: achievements || doctor.draftProfile.achievements || [],
      publications: publications || doctor.draftProfile.publications || [],
      socialLinks: {
        linkedin: socialLinks?.linkedin || doctor.draftProfile.socialLinks?.linkedin || '',
        twitter: socialLinks?.twitter || doctor.draftProfile.socialLinks?.twitter || '',
        website: socialLinks?.website || doctor.draftProfile.socialLinks?.website || ''
      },
      lastUpdated: new Date()
    };
    
    await doctor.save();
    
    res.json({ 
      message: 'Draft profile updated successfully.',
      draftProfile: doctor.draftProfile 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/doctors/:id/publish - Publish draft profile to public profile
router.put('/:id/publish', authenticateDoctor, async (req, res) => {
  try {
    // Ensure doctor can only publish their own profile
    if (req.params.id !== req.doctorId) {
      return res.status(403).json({ message: 'Not authorized to publish this profile.' });
    }
    
    const doctor = await Doctor.findById(req.doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found.' });
    }
    
    // Validate required fields
    if (!doctor.draftProfile.name || !doctor.draftProfile.specialization || !doctor.draftProfile.qualification) {
      return res.status(400).json({ 
        message: 'Name, specialization, and qualification are required to publish profile.' 
      });
    }
    
    // Copy draft profile to public profile
    doctor.publicProfile = {
      ...doctor.draftProfile,
      isPublished: true,
      publishedAt: new Date(),
      lastUpdated: new Date()
    };
    
    await doctor.save();
    
    res.json({ 
      message: 'Profile published successfully.',
      publicProfile: doctor.publicProfile 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/doctors/:id/public - Get doctor's public profile (no auth required)
router.get('/:id/public', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found.' });
    }
    
    if (!doctor.publicProfile.isPublished) {
      return res.status(404).json({ message: 'Doctor profile not published yet.' });
    }
    
    res.json({ publicProfile: doctor.publicProfile });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/doctors/:id/profile-status - Get profile publication status
router.get('/:id/profile-status', authenticateDoctor, async (req, res) => {
  try {
    // Ensure doctor can only check their own status
    if (req.params.id !== req.doctorId) {
      return res.status(403).json({ message: 'Not authorized to access this status.' });
    }
    
    const doctor = await Doctor.findById(req.doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found.' });
    }
    
    res.json({ 
      isPublished: doctor.publicProfile.isPublished,
      hasDraft: !!doctor.draftProfile.name,
      lastPublished: doctor.publicProfile.publishedAt,
      lastDraftUpdate: doctor.draftProfile.lastUpdated
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

export default router; 