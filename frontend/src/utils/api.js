// API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050';
const UPLOAD_BASE_URL = process.env.REACT_APP_UPLOAD_URL || 'http://localhost:5050';

export const API_ENDPOINTS = {
  // Base URLs
  API_BASE_URL,
  UPLOAD_BASE_URL,
  
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  SIGNUP: `${API_BASE_URL}/api/auth/signup`,
  PROFILE: `${API_BASE_URL}/api/auth/profile`,
  CHANGE_PASSWORD: `${API_BASE_URL}/api/auth/change-password`,
  DELETE_ACCOUNT: `${API_BASE_URL}/api/auth/delete-account`,
  VERIFY_EMAIL: `${API_BASE_URL}/api/auth/verify-email`,
  RESEND_VERIFICATION: `${API_BASE_URL}/api/auth/resend-verification`,
  REQUEST_RESET_OTP: `${API_BASE_URL}/api/auth/request-reset-otp`,
  VERIFY_RESET_OTP: `${API_BASE_URL}/api/auth/verify-reset-otp`,
  RESET_PASSWORD: `${API_BASE_URL}/api/auth/reset-password`,
  
  // Doctor endpoints
  DOCTOR_LOGIN: `${API_BASE_URL}/api/doctors/login`,
  DOCTOR_SIGNUP: `${API_BASE_URL}/api/doctors/signup`,
  DOCTOR_PROFILE: `${API_BASE_URL}/api/doctors/profile`,
  DOCTOR_PROFILE_AVATAR: `${API_BASE_URL}/api/doctors/profile/avatar`,
  DOCTOR_CHANGE_PASSWORD: `${API_BASE_URL}/api/doctors/change-password`,
  DOCTOR_APPOINTMENTS: `${API_BASE_URL}/api/doctors/appointments`,
  DOCTOR_PATIENTS: `${API_BASE_URL}/api/doctors/patients`,
  DOCTOR_PATIENT_PROFILE: (patientId) => `${API_BASE_URL}/api/doctors/patients/${patientId}`,
  DOCTOR_PATIENT_APPOINTMENTS: (patientId) => `${API_BASE_URL}/api/doctors/patients/${patientId}/appointments`,
  
  // Doctor Profile Management endpoints
  DOCTOR_DRAFT_PROFILE: (doctorId) => `${API_BASE_URL}/api/doctors/${doctorId}/draft`,
  DOCTOR_PUBLIC_PROFILE: (doctorId) => `${API_BASE_URL}/api/doctors/${doctorId}/public`,
  DOCTOR_PROFILE_STATUS: (doctorId) => `${API_BASE_URL}/api/doctors/${doctorId}/profile-status`,
  DOCTOR_PUBLISH_PROFILE: (doctorId) => `${API_BASE_URL}/api/doctors/${doctorId}/publish`,
  
  // General endpoints
  DOCTORS: `${API_BASE_URL}/api/doctors`,
  DOCTOR_BY_ID: (id) => `${API_BASE_URL}/api/doctors/${id}`,
  BOOK_APPOINTMENT: (doctorId) => `${API_BASE_URL}/api/doctors/${doctorId}/appointments`,
  
  // Appointment management endpoints
  APPOINTMENT_DETAILS: (id) => `${API_BASE_URL}/api/auth/appointments/${id}`,
  SUBMIT_REVIEW: (id) => `${API_BASE_URL}/api/auth/appointments/${id}/review`,
  DOCTOR_APPOINTMENT_DETAILS: (id) => `${API_BASE_URL}/api/doctors/appointments/${id}`,
  VERIFY_OTP: (id) => `${API_BASE_URL}/api/doctors/appointments/${id}/verify-otp`,
  UPDATE_TREATMENT_STATE: (id) => `${API_BASE_URL}/api/doctors/appointments/${id}/treatment-state`,
  DOCTOR_SUBMIT_REVIEW: (id) => `${API_BASE_URL}/api/doctors/appointments/${id}/review`,
};

export const UPLOAD_URLS = {
  AVATAR: (filename) => `${UPLOAD_BASE_URL}/uploads/avatars/${filename}`,
};

// Helper function to get avatar URL
export const getAvatarUrl = (avatar, isDoctor = false) => {
  if (!avatar) return null;
  
  if (avatar.startsWith('http')) {
    return avatar;
  }
  
  return UPLOAD_URLS.AVATAR(avatar);
};

// Helper function to make API requests
export const apiRequest = async (url, options = {}) => {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export default API_ENDPOINTS; 