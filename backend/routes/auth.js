import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import Appointment from '../models/Appointment.js';
import { 
  loginLimiter, 
  signupLimiter, 
  passwordResetLimiter, 
  emailVerificationLimiter 
} from '../middleware/rateLimit.js';
import {
  validateSignup,
  validateLogin,
  validatePasswordChange,
  validatePasswordResetRequest,
  validatePasswordReset,
  validateEmailVerification,
  sanitizeInput
} from '../middleware/validation.js';
import { 
  sendVerificationEmail, 
  sendPasswordResetEmail, 
  sendAccountLockedEmail,
  sendOtpEmail
} from '../utils/emailService.js';
import PendingUser from '../models/PendingUser.js';
import bcrypt from 'bcryptjs';
import { PendingPasswordReset } from '../models/User.js';

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register user (OTP-based)
// @route   POST /api/auth/signup
// @access  Public
router.post('/signup', 
  signupLimiter,
  sanitizeInput,
  validateSignup,
  async (req, res) => {
    try {
      const { name, email, password } = req.body;

      // Check if user already exists
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({
          success: false,
          message: 'User already exists'
        });
      }

      // Check if pending user exists
      const pending = await PendingUser.findOne({ email });
      if (pending) {
        return res.status(400).json({
          success: false,
          message: 'An OTP has already been sent to this email. Please check your inbox.'
        });
      }

      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min

      // Store in PendingUser (password as plain text)
      await PendingUser.create({
        name,
        email,
        password, // store as plain text for now
        otp,
        otpExpires
      });

      // Send OTP email
      await sendOtpEmail(email, name, otp);

      res.status(200).json({
        success: true,
        message: 'OTP sent to your email. Please verify to complete signup.'
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
);

// @desc    Verify OTP and create user
// @route   POST /api/auth/verify-otp
// @access  Public
router.post('/verify-otp', sanitizeInput, async (req, res) => {
  try {
    const { email, otp } = req.body;
    const pending = await PendingUser.findOne({ email });
    if (!pending) {
      return res.status(400).json({ success: false, message: 'No pending signup found for this email.' });
    }
    if (pending.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP.' });
    }
    if (pending.otpExpires < new Date()) {
      await PendingUser.deleteOne({ email });
      return res.status(400).json({ success: false, message: 'OTP expired. Please sign up again.' });
    }
    // Hash the password before creating the user
    const hashedPassword = await bcrypt.hash(pending.password, 12);
    // Create user
    const user = await User.create({
      name: pending.name,
      email: pending.email,
      password: hashedPassword,
      isEmailVerified: true
    });
    await PendingUser.deleteOne({ email });
    res.status(201).json({
      success: true,
      message: 'Signup successful! You can now log in.',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', 
  loginLimiter,
  sanitizeInput,
  validateLogin,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      // Check for user email
      const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check if account is locked
      if (user.isLocked()) {
        return res.status(423).json({
          success: false,
          message: 'Account is temporarily locked due to multiple failed login attempts. Please try again later.'
        });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        // Increment login attempts
        await user.incLoginAttempts();
        
        // Check if account should be locked
        const updatedUser = await User.findOne({ email }).select('+loginAttempts +lockUntil');
        if (updatedUser.isLocked()) {
          // Send account locked email
          await sendAccountLockedEmail(user);
          
          return res.status(423).json({
            success: false,
            message: 'Account is temporarily locked due to multiple failed login attempts. Please check your email for more information.'
          });
        }

        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Reset login attempts on successful login
      await user.resetLoginAttempts();

      // Check if email is verified
      if (!user.isEmailVerified) {
        return res.status(403).json({
          success: false,
          message: 'Please verify your email address before logging in',
          requiresVerification: true
        });
      }

      res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified
        },
        token: generateToken(user._id)
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
);

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Change user password
// @route   POST /api/auth/change-password
// @access  Private
router.post('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// @desc    Delete user account
// @route   DELETE /api/auth/delete-account
// @access  Private
router.delete('/delete-account', protect, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({ success: true, message: 'Account deleted successfully.' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// @desc    Get all appointments for the logged-in user
// @route   GET /api/auth/my-appointments
// @access  Private
router.get('/my-appointments', protect, async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user._id })
      .populate('doctor', 'name specialization email avatar')
      .sort({ date: 1, time: 1 });
    res.json({ success: true, appointments });
  } catch (error) {
    console.error('Get my appointments error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// @desc    Verify email address
// @route   POST /api/auth/verify-email
// @access  Public
router.post('/verify-email', 
  emailVerificationLimiter,
  sanitizeInput,
  validateEmailVerification,
  async (req, res) => {
    try {
      const { token } = req.body;

      // Hash the token
      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

      // Find user with this token
      const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpires: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired verification token'
        });
      }

      // Mark email as verified
      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save();

      res.json({
        success: true,
        message: 'Email verified successfully',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          isEmailVerified: user.isEmailVerified
        },
        token: generateToken(user._id)
      });
    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
);

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
router.post('/resend-verification',
  emailVerificationLimiter,
  sanitizeInput,
  validatePasswordResetRequest, // Reuse email validation
  async (req, res) => {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (user.isEmailVerified) {
        return res.status(400).json({
          success: false,
          message: 'Email is already verified'
        });
      }

      // Generate new verification token
      const verificationToken = user.generateEmailVerificationToken();
      await user.save();

      // Send verification email
      await sendVerificationEmail(user, verificationToken);

      res.json({
        success: true,
        message: 'Verification email sent successfully'
      });
    } catch (error) {
      console.error('Resend verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
);

// @desc    Request password reset OTP
// @route   POST /api/auth/request-reset-otp
// @access  Public
router.post('/request-reset-otp', sanitizeInput, validatePasswordResetRequest, async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists
      return res.json({ success: true, message: 'If an account with that email exists, an OTP has been sent.' });
    }
    // Remove any existing pending resets for this email
    await PendingPasswordReset.deleteMany({ email });
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    await PendingPasswordReset.create({ email, otp, otpExpires });
    // Send OTP email
    await sendOtpEmail(email, user.name || 'User', otp);
    res.json({ success: true, message: 'If an account with that email exists, an OTP has been sent.' });
  } catch (error) {
    console.error('Request reset OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// @desc    Verify password reset OTP
// @route   POST /api/auth/verify-reset-otp
// @access  Public
router.post('/verify-reset-otp', sanitizeInput, async (req, res) => {
  try {
    const { email, otp } = req.body;
    const pending = await PendingPasswordReset.findOne({ email });
    if (!pending) {
      return res.status(400).json({ success: false, message: 'No pending reset found for this email.' });
    }
    if (pending.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP.' });
    }
    if (pending.otpExpires < new Date()) {
      await PendingPasswordReset.deleteOne({ email });
      return res.status(400).json({ success: false, message: 'OTP expired. Please request a new one.' });
    }
    pending.verified = true;
    await pending.save();
    res.json({ success: true, message: 'OTP verified. You may now reset your password.' });
  } catch (error) {
    console.error('Verify reset OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// @desc    Reset password after OTP or token verification
// @route   POST /api/auth/reset-password
// @access  Public
router.post('/reset-password', sanitizeInput, validatePasswordReset, async (req, res) => {
  try {
    const { email, password, token } = req.body;
    if (token) {
      // Token-based reset (e.g., from email link)
      // Hash the token
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
      // Find user with this reset token and check expiry
      const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
      }).select('+password');
      if (!user) {
        return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
      }
      user.password = password;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
      return res.json({ success: true, message: 'Password reset successfully.' });
    } else if (email) {
      // OTP-based reset (existing flow)
      const pending = await PendingPasswordReset.findOne({ email });
      if (!pending || !pending.verified) {
        return res.status(400).json({ success: false, message: 'OTP verification required.' });
      }
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }
      user.password = password;
      await user.save();
      await PendingPasswordReset.deleteOne({ email });
      return res.json({ success: true, message: 'Password reset successfully.' });
    } else {
      return res.status(400).json({ success: false, message: 'Email or token required.' });
    }
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

export default router; 