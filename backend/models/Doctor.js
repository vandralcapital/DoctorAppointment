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
  locationLink: { type: String, default: '' },
  bio: { type: String, default: '' },
  yearsOfExperience: { type: Number, min: 0, default: 0 },
  hospitalName: { type: String, default: '' },
  department: { type: String, default: '' },
  address: {
    line1: { type: String, default: '' },
    line2: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    district: { type: String, default: '' },
    pinCode: { type: String, default: '' }
  },
  availableSlots: [
    {
      date: { type: Date, required: true },
      time: { type: String, required: true }, // e.g., '09:30'
    }
  ],
  // Draft profile for editing and preview
  draftProfile: {
    name: { type: String },
    specialization: { type: String },
    qualification: { type: String },
    avatar: { type: String },
    phone: { type: String },
    location: { type: String },
    locationLink: { type: String },
    bio: { type: String },
    yearsOfExperience: { type: Number, min: 0 },
    education: [{ type: String }], // Array of educational qualifications
    certifications: [{ type: String }], // Array of certifications
    languages: [{ type: String }], // Languages spoken
    consultationFee: { type: Number, min: 0 },
    consultationDuration: { type: Number, min: 15, default: 30 }, // in minutes
    specialties: [{ type: String }], // Array of specialties
    experience: [{ 
      position: { type: String },
      hospital: { type: String },
      duration: { type: String },
      description: { type: String }
    }],
    achievements: [{ type: String }], // Array of achievements/awards
    publications: [{ type: String }], // Array of publications
    socialLinks: {
      linkedin: { type: String },
      twitter: { type: String },
      website: { type: String }
    },
    lastUpdated: { type: Date, default: Date.now }
  },
  // Published profile visible to patients
  publicProfile: {
    name: { type: String },
    specialization: { type: String },
    qualification: { type: String },
    avatar: { type: String },
    phone: { type: String },
    location: { type: String },
    locationLink: { type: String },
    bio: { type: String },
    yearsOfExperience: { type: Number, min: 0 },
    education: [{ type: String }],
    certifications: [{ type: String }],
    languages: [{ type: String }],
    consultationFee: { type: Number, min: 0 },
    consultationDuration: { type: Number, min: 15, default: 30 },
    specialties: [{ type: String }],
    experience: [{ 
      position: { type: String },
      hospital: { type: String },
      duration: { type: String },
      description: { type: String }
    }],
    achievements: [{ type: String }],
    publications: [{ type: String }],
    socialLinks: {
      linkedin: { type: String },
      twitter: { type: String },
      website: { type: String }
    },
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },
    lastUpdated: { type: Date, default: Date.now }
  },
  createdAt: { type: Date, default: Date.now },
});

doctorSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const Doctor = mongoose.model('Doctor', doctorSchema);
export default Doctor; 