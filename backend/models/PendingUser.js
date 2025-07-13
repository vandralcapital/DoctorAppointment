import mongoose from 'mongoose';

const pendingUserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    min: 0,
    max: 120
  },
  mobile: {
    type: String,
    trim: true,
    maxlength: 20
  },
  city: {
    type: String,
    trim: true,
    maxlength: 100
  },
  pinCode: {
    type: String,
    trim: true,
    maxlength: 10
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  otp: {
    type: String,
    required: true
  },
  otpExpires: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 // auto-remove after 10 minutes
  }
});

const PendingUser = mongoose.model('PendingUser', pendingUserSchema);
export default PendingUser; 