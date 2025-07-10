import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../utils/api';

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const SettingsModal = ({ open, onClose }) => {
  const { token, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [form, setForm] = useState({ current: '', new: '', confirm: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.current || !form.new || !form.confirm) {
      setError('All fields are required.');
      return;
    }
    if (form.new !== form.confirm) {
      setError('New passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.CHANGE_PASSWORD, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword: form.current, newPassword: form.new }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess('Password changed successfully!');
        setForm({ current: '', new: '', confirm: '' });
      } else {
        setError(data.message || 'Failed to change password.');
        if (res.status === 401) {
          setTimeout(() => logout(), 1500);
        }
      }
    } catch (err) {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.DELETE_ACCOUNT, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess('Account deleted successfully. Logging out...');
        setTimeout(() => {
          setLoading(false);
          logout();
          onClose();
        }, 1500);
      } else {
        setError(data.message || 'Failed to delete account.');
        setLoading(false);
      }
    } catch (err) {
      setError('Network error.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex relative animate-fade-in overflow-hidden">
        <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold z-10" onClick={onClose}>&times;</button>
        {/* Sidebar */}
        <aside className="w-1/3 min-w-[180px] bg-gray-50 border-r flex flex-col py-8 px-4">
          <div className="mb-8">
            <span className="text-lg font-bold text-blue-700">Settings</span>
          </div>
          <nav className="flex flex-col gap-2">
            <button
              className={`text-left px-4 py-2 rounded-lg font-medium transition ${activeTab === 'account' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-700'}`}
              onClick={() => setActiveTab('account')}
            >
              Account
            </button>
            <button
              className={`text-left px-4 py-2 rounded-lg font-medium transition ${activeTab === 'danger' ? 'bg-red-100 text-red-700' : 'hover:bg-red-50 text-red-600'}`}
              onClick={() => setActiveTab('danger')}
            >
              Danger Zone
            </button>
          </nav>
        </aside>
        {/* Main content */}
        <main className="flex-1 p-8 bg-white min-h-[400px]">
          {activeTab === 'account' && (
            <>
              <h2 className="text-2xl font-bold mb-6 text-blue-700">Account</h2>
              <form onSubmit={handlePasswordChange} className="flex flex-col gap-3 mb-8 max-w-md">
                <label className="font-semibold text-gray-700">Change Password</label>
                <input type="password" name="current" placeholder="Current Password" value={form.current} onChange={handleChange} className="rounded-lg border px-4 py-2" />
                <input type="password" name="new" placeholder="New Password" value={form.new} onChange={handleChange} className="rounded-lg border px-4 py-2" />
                <input type="password" name="confirm" placeholder="Confirm New Password" value={form.confirm} onChange={handleChange} className="rounded-lg border px-4 py-2" />
                {error && <div className="text-red-500 text-sm">{error}</div>}
                {success && <div className="text-green-600 text-sm">{success}</div>}
                <button type="submit" className="bg-blue-700 text-white rounded-lg py-2 font-semibold hover:bg-blue-800 transition">Change Password</button>
              </form>
            </>
          )}
          {activeTab === 'danger' && (
            <div className="max-w-md">
              <h2 className="text-2xl font-bold mb-6 text-red-700">Danger Zone</h2>
              {showDeleteConfirm ? (
                <div className="flex flex-col gap-2">
                  <span className="text-red-600 text-sm">Are you sure? This cannot be undone.</span>
                  <div className="flex gap-2">
                    <button className="bg-red-600 text-white rounded-lg px-4 py-2 font-semibold hover:bg-red-700 transition disabled:opacity-60" onClick={handleDelete} disabled={loading}>
                      {loading ? 'Deleting...' : 'Delete Account'}
                    </button>
                    <button className="bg-gray-200 text-gray-700 rounded-lg px-4 py-2 font-semibold hover:bg-gray-300 transition" onClick={() => setShowDeleteConfirm(false)} disabled={loading}>Cancel</button>
                  </div>
                  {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
                  {success && <div className="text-green-600 text-sm mt-2">{success}</div>}
                </div>
              ) : (
                <button className="bg-red-100 text-red-600 rounded-lg px-4 py-2 font-semibold hover:bg-red-200 transition" onClick={() => setShowDeleteConfirm(true)}>Delete Account</button>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const Navbar = ({ minimal = false }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const avatarRef = useRef();

  // Doctor detection
  const isDoctor = !!localStorage.getItem('doctorToken');
  const doctorInfo = localStorage.getItem('doctorInfo') ? JSON.parse(localStorage.getItem('doctorInfo')) : null;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  // Avatar logic
  const avatarUrl = isDoctor
    ? (doctorInfo?.avatar?.startsWith('http')
        ? doctorInfo.avatar
        : doctorInfo?.avatar
          ? `${API_ENDPOINTS.UPLOAD_BASE_URL}/uploads/avatars/${doctorInfo.avatar}`
          : null)
    : (user?.avatar?.startsWith('http')
        ? user.avatar
        : user?.avatar
          ? `${API_ENDPOINTS.UPLOAD_BASE_URL}/uploads/avatars/${user.avatar}`
          : null);

  const displayName = isDoctor ? doctorInfo?.name : user?.name;

  return (
    <>
      <nav className="w-full bg-white shadow flex items-center justify-between px-8 py-4 z-50 relative">
        {!minimal && (
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-blue-700">Parchi</span>
          </div>
        )}
        {!minimal && (
          <div className="hidden md:flex space-x-8 text-gray-700 font-medium">
            <Link to="/" className={location.pathname === '/' ? 'text-blue-700 font-semibold' : 'hover:text-blue-700'}>Home</Link>
            <a href="#" className="hover:text-blue-700">Find a Doctor</a>
            <a href="#" className="hover:text-blue-700">Services</a>
            <a href="#" className="hover:text-blue-700">About Us</a>
            <a href="#" className="hover:text-blue-700">Contact</a>
          </div>
        )}
        <div className="flex items-center space-x-4 relative">
          {isAuthenticated || isDoctor ? (
            <div className="relative" ref={avatarRef}>
              <div
                className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-600 overflow-hidden cursor-pointer"
                onClick={() => setDropdownOpen((open) => !open)}
              >
                {avatarUrl
                  ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  : (displayName ? displayName[0] : 'D')}
              </div>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-100 animate-fade-in">
                  <div className="px-4 py-2 text-gray-700 font-semibold border-b">{displayName}</div>
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                    onClick={() => { setDropdownOpen(false); navigate(isDoctor ? '/doctor-dashboard' : '/dashboard'); }}
                  >
                    {isDoctor ? 'Doctor Dashboard' : 'Dashboard'}
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                    onClick={() => { setDropdownOpen(false); setSettingsOpen(true); }}
                  >
                    {isDoctor ? 'Doctor Settings' : 'Settings'}
                  </button>
                  {!isDoctor && (
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                      onClick={() => { setDropdownOpen(false); navigate('/my-appointments'); }}
                    >
                      My Appointments
                    </button>
                  )}
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                    onClick={() => { setDropdownOpen(false); /* TODO: change photo */ }}
                  >
                    Change Photo
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link 
                to="/login" 
                className={location.pathname === '/login' ? 'bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold shadow cursor-not-allowed opacity-60' : 'text-blue-700 hover:text-blue-800 font-semibold transition'}
                tabIndex={location.pathname === '/login' ? -1 : 0}
                aria-disabled={location.pathname === '/login'}
              >
                Login
              </Link>
              <Link 
                to="/signup" 
                className={location.pathname === '/signup' ? 'bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold shadow cursor-not-allowed opacity-60' : 'bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold shadow hover:bg-blue-800 transition'}
                tabIndex={location.pathname === '/signup' ? -1 : 0}
                aria-disabled={location.pathname === '/signup'}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
};

export default Navbar; 