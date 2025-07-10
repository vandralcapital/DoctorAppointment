import React from 'react';
import { Navigate } from 'react-router-dom';

const DoctorProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('doctorToken');
  if (!token) {
    return <Navigate to="/doctor-login" replace />;
  }
  return children;
};

export default DoctorProtectedRoute; 