import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  specialization: { type: String, required: true },
  qualification: { type: String, required: true }, // e.g., MBBS, MD, etc.
  avatar: { type: String }, // URL or filename for avatar image
  phone: { type: String, default: '' },
  location: { type: String, default: '' },
  bio: { type: String, default: '' },
  yearsOfExperience: { type: Number, min: 0, default: 0 },
  availableSlots: [
    {
      date: { type: Date, required: true },
      time: { type: String, required: true }, // e.g., '09:30'
    }
  ],
  createdAt: { type: Date, default: Date.now },
});

doctorSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const Doctor = mongoose.model('Doctor', doctorSchema);
export default Doctor; 