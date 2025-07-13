import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true, index: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional link to User
  patientName: { type: String, required: true },
  date: { type: String, required: true }, // e.g., '26 Mar ' 2024'
  time: { type: String, required: true }, // e.g., '09:00 - 10:00 AM'
  treatment: { type: String, required: true },
  status: { type: String, enum: ['upcoming', 'past', 'cancelled'], default: 'upcoming' },
  treatmentState: { type: String, enum: ['pending', 'verified', 'treated', 'no-show'], default: 'pending' },
  otp: { type: String, required: true }, // 6-digit OTP for verification
  otpExpires: { type: Date, required: true }, // OTP expiration time
  otpVerified: { type: Boolean, default: false }, // Whether OTP was verified by doctor
  prescriptionFile: { type: String }, // file path or URL
  prescriptionText: { type: String }, // text-based prescription
  review: {
    rating: { type: Number, min: 1, max: 10 }, // 10-star rating system
    comment: { type: String, maxlength: 500 },
    createdAt: { type: Date }
  },
  doctorNotes: { type: String, maxlength: 1000 }, // Doctor's notes about the appointment
  createdAt: { type: Date, default: Date.now },
});

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment; 