import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!validateForm()) return;
    setLoading(true);
    const result = await login(formData.email, formData.password);
    setLoading(false);
    if (result.success) {
      navigate('/');
    } else {
      setMessage(result.message);
    }
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
            <h2 className="text-4xl font-extrabold mb-4 leading-tight font-serif">Welcome Back to Parchi</h2>
            <p className="text-lg mb-8 opacity-90">Book, manage, and track your doctor appointments with ease. Your health journey starts here.</p>
          </div>
          <div>
            <p className="text-sm italic mb-2 opacity-80">"Your health, our priority—always."</p>
            <p className="text-sm font-semibold">Team Parchi</p>
          </div>
        </div>
        {/* Right: Login form */}
        <div className="flex-1 flex flex-col justify-center px-6 py-10 md:px-16 bg-white h-full">
          <h2 className="text-3xl font-extrabold mb-2 text-gray-900 font-serif">Sign in to your Parchi account</h2>
          <div className="mb-4 text-base text-gray-500">
            New to Parchi? <Link to="/signup" className="text-blue-700 font-semibold hover:underline">Create an account</Link>
          </div>
          {/* Social login */}
          <div className="flex flex-col gap-3 mb-4">
            <button type="button" className="w-full flex items-center justify-center gap-2 border border-gray-200 rounded-full py-3 bg-white hover:bg-blue-50 transition text-base font-semibold text-gray-700 shadow-sm">
              <svg className="w-5 h-5" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.7 33.9 29.8 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.5 4.5 29.5 2 24 2 12.9 2 4 10.9 4 22s8.9 20 20 20c11.1 0 20-8.9 20-20 0-1.3-.1-2.7-.3-4z"/><path fill="#34A853" d="M6.3 14.7l7 5.1C15.1 17.1 19.2 14 24 14c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.5 4.5 29.5 2 24 2 15.3 2 7.8 7.7 6.3 14.7z"/><path fill="#FBBC05" d="M24 44c5.5 0 10.5-1.8 14.4-4.9l-6.6-5.4C29.7 35.7 26.9 37 24 37c-5.7 0-10.6-3.1-13.1-7.7l-7 5.4C7.8 40.3 15.3 44 24 44z"/><path fill="#EA4335" d="M44.5 20H24v8.5h11.7c-1.6 4.2-6.1 7.5-11.7 7.5-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.5 4.5 29.5 2 24 2 12.9 2 4 10.9 4 22s8.9 20 20 20c11.1 0 20-8.9 20-20 0-1.3-.1-2.7-.3-4z"/></g></svg>
              Continue with Google
            </button>
          </div>
          <div className="flex items-center my-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="mx-3 text-gray-400 text-sm font-semibold">OR</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
            <input
              type="text"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className={`rounded-full px-5 py-3 border border-gray-200 focus:border-blue-700 focus:ring-0 bg-white text-base shadow-sm ${errors.email ? 'border-red-400' : ''}`}
              autoComplete="username"
            />
            {errors.email && <span className="text-xs text-red-500 ml-2">{errors.email}</span>}
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className={`rounded-full px-5 py-3 border border-gray-200 focus:border-blue-700 focus:ring-0 bg-white text-base shadow-sm ${errors.password ? 'border-red-400' : ''}`}
              autoComplete="current-password"
            />
            {errors.password && <span className="text-xs text-red-500 ml-2">{errors.password}</span>}
            {message && <div className="text-center text-red-500 text-sm mt-2">{message}</div>}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-blue-700 text-white rounded-full py-3 mt-1 font-semibold text-base hover:bg-blue-800 transition disabled:opacity-60 shadow-sm"
              disabled={loading}
            >
              Login
            </button>
          </form>
          
          <div className="mt-4 text-center">
            <Link to="/forgot-password" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Forgot your password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 