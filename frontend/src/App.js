import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import DoctorSignup from './components/DoctorSignup';
import DoctorLogin from './components/DoctorLogin';
import DoctorDashboard from './components/DoctorDashboard';
import DoctorProtectedRoute from './components/DoctorProtectedRoute';
import BookAppointment from './components/BookAppointment';
import Error404 from './components/Error404';
import Error500 from './components/Error500';
import EmailVerification from './components/EmailVerification';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import { Suspense, lazy } from 'react';
import './App.css';
import MyAppointments from './components/MyAppointments';

const DoctorProfile = lazy(() => import('./components/doctor-dashboard/ProfilePage'));
const DoctorAppointmentsToday = lazy(() => import('./components/doctor-dashboard/AppointmentsTodayPage'));
const DoctorLanguage = lazy(() => import('./components/doctor-dashboard/LanguagePage'));
const DoctorNotifications = lazy(() => import('./components/doctor-dashboard/NotificationsPage'));
const DoctorPayments = lazy(() => import('./components/doctor-dashboard/PaymentsPage'));
const DoctorTaxes = lazy(() => import('./components/doctor-dashboard/TaxesPage'));
const DoctorTransactions = lazy(() => import('./components/doctor-dashboard/TransactionsPage'));
const DoctorPassword = lazy(() => import('./components/doctor-dashboard/PasswordPage'));
const DoctorAccess = lazy(() => import('./components/doctor-dashboard/AccessPage'));
const DoctorSessions = lazy(() => import('./components/doctor-dashboard/SessionsPage'));
const PatientListPage = React.lazy(() => import('./components/doctor-dashboard/PatientListPage'));
const PatientProfilePage = React.lazy(() => import('./components/doctor-dashboard/PatientProfilePage'));
const PublicProfilePage = React.lazy(() => import('./components/doctor-dashboard/PublicProfilePage'));

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-email" element={<EmailVerification />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/doctor-signup" element={<DoctorSignup />} />
            <Route path="/doctor-login" element={<DoctorLogin />} />
            <Route path="/doctor-dashboard" element={<DoctorProtectedRoute><DoctorDashboard /></DoctorProtectedRoute>}>
              <Route path="profile" element={<Suspense fallback={<div>Loading...</div>}><DoctorProfile /></Suspense>} />
              <Route path="appointments-today" element={<Suspense fallback={<div>Loading...</div>}><DoctorAppointmentsToday /></Suspense>} />
              <Route path="language" element={<Suspense fallback={<div>Loading...</div>}><DoctorLanguage /></Suspense>} />
              <Route path="notifications" element={<Suspense fallback={<div>Loading...</div>}><DoctorNotifications /></Suspense>} />
              <Route path="payments" element={<Suspense fallback={<div>Loading...</div>}><DoctorPayments /></Suspense>} />
              <Route path="taxes" element={<Suspense fallback={<div>Loading...</div>}><DoctorTaxes /></Suspense>} />
              <Route path="transactions" element={<Suspense fallback={<div>Loading...</div>}><DoctorTransactions /></Suspense>} />
              <Route path="password" element={<Suspense fallback={<div>Loading...</div>}><DoctorPassword /></Suspense>} />
              <Route path="access" element={<Suspense fallback={<div>Loading...</div>}><DoctorAccess /></Suspense>} />
              <Route path="sessions" element={<Suspense fallback={<div>Loading...</div>}><DoctorSessions /></Suspense>} />
              <Route path="patients" element={<Suspense fallback={<div>Loading...</div>}><PatientListPage /></Suspense>} />
              <Route path="patients/:patientId" element={<Suspense fallback={<div>Loading...</div>}><PatientProfilePage /></Suspense>} />
              <Route path="public-profile" element={<Suspense fallback={<div>Loading...</div>}><PublicProfilePage /></Suspense>} />
            </Route>
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/book/:doctorId/:bookingId" element={<BookAppointment />} />
            <Route path="/my-appointments" element={<ProtectedRoute><MyAppointments /></ProtectedRoute>} />
            
            {/* Error Routes */}
            <Route path="/500" element={<Error500 />} />
            <Route path="*" element={<Error404 />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
