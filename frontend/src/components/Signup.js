import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_ENDPOINTS } from '../utils/api';
import Navbar from './Navbar';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    mobile: '',
    email: '',
    city: '',
    pinCode: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.age) newErrors.age = 'Age is required';
    if (formData.age && (isNaN(formData.age) || formData.age < 0 || formData.age > 120)) newErrors.age = 'Enter a valid age';
    if (!formData.mobile) newErrors.mobile = 'Mobile is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.pinCode) newErrors.pinCode = 'PinCode is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!validateForm()) return;
    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.SIGNUP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          age: formData.age,
          mobile: formData.mobile,
          email: formData.email,
          city: formData.city,
          pinCode: formData.pinCode,
          password: formData.password
        })
      });
      const data = await response.json();
      if (response.ok) {
        setOtpStep(true);
        setSignupEmail(formData.email);
        setMessage(data.message || 'OTP sent to your email. Please verify.');
      } else {
        setMessage(data.message || 'Signup failed.');
      }
    } catch (err) {
      setMessage('Network error. Please try again.');
    }
    setLoading(false);
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setOtpError('');
    setOtpLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.API_BASE_URL + '/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: signupEmail, otp })
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('Signup successful! You can now log in.');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setOtpError(data.message || 'Invalid OTP.');
      }
    } catch (err) {
      setOtpError('Network error. Please try again.');
    }
    setOtpLoading(false);
  };

  return (
    <div className="w-screen h-screen min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col md:flex-row font-sans">
        {/* Left: Blue panel styled like landing page */}
        <div className="hidden md:flex flex-col justify-between bg-blue-700 text-white p-12 w-1/2 h-full">
          <div>
            <div className="mb-8">
              <span className="inline-block w-2 h-2 rounded-full bg-white mr-2 align-middle"></span>
              <span className="font-semibold text-base tracking-wide">Parchi</span>
            </div>
            <h2 className="text-4xl font-extrabold mb-4 leading-tight font-serif">Book Appointments Effortlessly</h2>
            <p className="text-lg mb-8 opacity-90">Your health, your schedule. Find and book top doctors in just a few clicks with Parchi.</p>
          </div>
          <div>
            <p className="text-sm italic mb-2 opacity-80">"The best time to take care of your health is now."</p>
            <p className="text-sm font-semibold">Team Parchi</p>
          </div>
        </div>
        {/* Right: Signup form */}
        <div className="flex-1 flex flex-col justify-center px-6 py-10 md:px-16 bg-white h-full relative">
          <h2 className="text-3xl font-extrabold mb-2 text-gray-900 font-serif">Create your Parchi account</h2>
          <div className="mb-4 text-base text-gray-500">
            Already have an account? <Link to="/login" className="text-blue-700 font-semibold hover:underline">Login</Link>
          </div>
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
            <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} className="rounded-full px-5 py-3 border border-gray-200 focus:border-blue-700 focus:ring-0 bg-white text-base shadow-sm" autoComplete="name" />
            {errors.name && <span className="text-xs text-red-500 ml-2">{errors.name}</span>}
            <input type="number" name="age" placeholder="Age" value={formData.age} onChange={handleChange} className="rounded-full px-5 py-3 border border-gray-200 focus:border-blue-700 focus:ring-0 bg-white text-base shadow-sm" min="0" max="120" />
            {errors.age && <span className="text-xs text-red-500 ml-2">{errors.age}</span>}
            <input type="text" name="mobile" placeholder="Mobile" value={formData.mobile} onChange={handleChange} className="rounded-full px-5 py-3 border border-gray-200 focus:border-blue-700 focus:ring-0 bg-white text-base shadow-sm" maxLength={20} />
            {errors.mobile && <span className="text-xs text-red-500 ml-2">{errors.mobile}</span>}
            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className={`rounded-full px-5 py-3 border border-gray-200 focus:border-blue-700 focus:ring-0 bg-white text-base shadow-sm ${errors.email ? 'border-red-400' : ''}`} autoComplete="username" />
            {errors.email && <span className="text-xs text-red-500 ml-2">{errors.email}</span>}
            <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} className="rounded-full px-5 py-3 border border-gray-200 focus:border-blue-700 focus:ring-0 bg-white text-base shadow-sm" maxLength={100} />
            {errors.city && <span className="text-xs text-red-500 ml-2">{errors.city}</span>}
            <input type="text" name="pinCode" placeholder="PinCode" value={formData.pinCode} onChange={handleChange} className="rounded-full px-5 py-3 border border-gray-200 focus:border-blue-700 focus:ring-0 bg-white text-base shadow-sm" maxLength={10} />
            {errors.pinCode && <span className="text-xs text-red-500 ml-2">{errors.pinCode}</span>}
            <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} className={`rounded-full px-5 py-3 border border-gray-200 focus:border-blue-700 focus:ring-0 bg-white text-base shadow-sm ${errors.password ? 'border-red-400' : ''}`} autoComplete="new-password" />
            {errors.password && <span className="text-xs text-red-500 ml-2">{errors.password}</span>}
            <input type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} className={`rounded-full px-5 py-3 border border-gray-200 focus:border-blue-700 focus:ring-0 bg-white text-base shadow-sm ${errors.confirmPassword ? 'border-red-400' : ''}`} autoComplete="new-password" />
            {errors.confirmPassword && <span className="text-xs text-red-500 ml-2">{errors.confirmPassword}</span>}
            {message && <div className="text-center text-red-500 text-sm mt-2">{message}</div>}
            <div className="text-xs text-gray-400 mt-2 mb-1">
              By signing up, you agree to our <span className="underline">Terms & Conditions</span> and <span className="underline">Privacy Policy</span>
            </div>
            <button type="submit" className="w-full flex items-center justify-center gap-2 bg-blue-700 text-white rounded-full py-3 mt-1 font-semibold text-base hover:bg-blue-800 transition disabled:opacity-60 shadow-sm" disabled={loading}>
              {loading ? 'Signing Up...' : 'Sign Up'}
            </button>
          </form>
          {/* OTP Modal Overlay */}
          {otpStep && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <form onSubmit={handleOtpSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md relative">
                <h2 className="text-2xl font-bold mb-6 text-blue-700">Verify OTP</h2>
                {message && <div className="bg-green-100 text-green-700 p-2 rounded mb-4">{message}</div>}
                {otpError && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{otpError}</div>}
                <div className="mb-4">
                  <label className="block mb-1 font-semibold">Enter the 6-digit OTP sent to your email</label>
                  <input
                    type="text"
                    name="otp"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    required
                    className="w-full border rounded px-3 py-2 text-center text-lg tracking-widest"
                    maxLength={6}
                    pattern="\d{6}"
                  />
                </div>
                <button type="submit" disabled={otpLoading} className="w-full bg-blue-700 text-white py-2 rounded font-semibold hover:bg-blue-800 transition">
                  {otpLoading ? 'Verifying...' : 'Verify & Complete Signup'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Signup; 