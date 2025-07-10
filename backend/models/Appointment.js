import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true, index: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional link to User
  patientName: { type: String, required: true },
  date: { type: String, required: true }, // e.g., '26 Mar ’ 2024'
  time: { type: String, required: true }, // e.g., '09:00 - 10:00 AM'
  treatment: { type: String, required: true },
  status: { type: String, enum: ['upcoming', 'past', 'cancelled'], default: 'upcoming' },
  createdAt: { type: Date, default: Date.now },
  prescriptionFile: { type: String }, // file path or URL
  prescriptionText: { type: String }, // text-based prescription
});

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment; 