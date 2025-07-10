import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Email templates
const emailTemplates = {
  verification: (name, token) => ({
    subject: 'Verify Your Email - Parchi',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Parchi</h1>
          <p style="color: white; margin: 10px 0 0 0;">Doctor Appointment Booking System</p>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${name}!</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Thank you for signing up with Parchi. To complete your registration, please verify your email address by clicking the button below.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/verify-email?token=${token}" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            If the button doesn't work, you can copy and paste this link into your browser:
          </p>
          <p style="color: #667eea; word-break: break-all; margin-bottom: 20px;">
            ${process.env.FRONTEND_URL}/verify-email?token=${token}
          </p>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            This link will expire in 24 hours. If you didn't create an account with Parchi, you can safely ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            © 2025 Parchi. All rights reserved.
          </p>
        </div>
      </div>
    `
  }),

  passwordReset: (name, token) => ({
    subject: 'Reset Your Password - Parchi',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Parchi</h1>
          <p style="color: white; margin: 10px 0 0 0;">Doctor Appointment Booking System</p>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${name}!</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            You requested to reset your password. Click the button below to create a new password.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/reset-password?token=${token}" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            If the button doesn't work, you can copy and paste this link into your browser:
          </p>
          <p style="color: #667eea; word-break: break-all; margin-bottom: 20px;">
            ${process.env.FRONTEND_URL}/reset-password?token=${token}
          </p>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            This link will expire in 10 minutes. If you didn't request a password reset, you can safely ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            © 2025 Parchi. All rights reserved.
          </p>
        </div>
      </div>
    `
  }),

  accountLocked: (name) => ({
    subject: 'Account Temporarily Locked - Parchi',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Parchi</h1>
          <p style="color: white; margin: 10px 0 0 0;">Security Alert</p>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${name}!</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            We detected multiple failed login attempts on your account. For your security, your account has been temporarily locked for 2 hours.
          </p>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            If this was you, you can try logging in again after the lock period expires. If you didn't attempt to log in, please contact our support team immediately.
          </p>
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="color: #856404; margin: 0;">
              <strong>Security Tip:</strong> Consider using a strong, unique password and enabling two-factor authentication if available.
            </p>
          </div>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            © 2025 Parchi. All rights reserved.
          </p>
        </div>
      </div>
    `
  })
};

// Send email function
export const sendEmail = async (to, template, data = {}) => {
  try {
    const transporter = createTransporter();
    const emailTemplate = emailTemplates[template](data.name, data.token);
    
    const mailOptions = {
      from: `"Parchi" <${process.env.EMAIL_USER}>`,
      to,
      subject: emailTemplate.subject,
      html: emailTemplate.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Send verification email
export const sendVerificationEmail = async (user, token) => {
  return await sendEmail(user.email, 'verification', {
    name: user.name,
    token
  });
};

// Send password reset email
export const sendPasswordResetEmail = async (user, token) => {
  return await sendEmail(user.email, 'passwordReset', {
    name: user.name,
    token
  });
};

// Send account locked email
export const sendAccountLockedEmail = async (user) => {
  return await sendEmail(user.email, 'accountLocked', {
    name: user.name
  });
};

export const sendOtpEmail = async (to, name, otp) => {
  const transporter = createTransporter();
  const mailOptions = {
    from: `"Parchi" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Your Parchi Signup OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Parchi</h1>
          <p style="color: white; margin: 10px 0 0 0;">Doctor Appointment Booking System</p>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${name}!</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Your OTP for Parchi signup is:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 2rem; font-weight: bold; color: #667eea; letter-spacing: 8px;">${otp}</span>
          </div>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            This OTP is valid for 10 minutes. If you did not request this, you can ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            © 2025 Parchi. All rights reserved.
          </p>
        </div>
      </div>
    `
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('OTP Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('OTP Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

export default {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendAccountLockedEmail,
  sendOtpEmail
}; 