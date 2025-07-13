import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import { API_ENDPOINTS } from '../utils/api';

const Profile = () => {
  const { user, token } = useAuth();
  const [form, setForm] = useState({
    name: '',
    age: '',
    mobile: '',
    email: '',
    city: '',
    pinCode: ''
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(API_ENDPOINTS.PROFILE, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.user) {
          setForm({
            name: data.user.name || '',
            age: data.user.age || '',
            mobile: data.user.mobile || '',
            email: data.user.email || '',
            city: data.user.city || '',
            pinCode: data.user.pinCode || ''
          });
        } else {
          setError(data.message || 'Failed to load profile');
        }
      } catch (err) {
        setError('Network error');
      }
      setLoading(false);
    };
    if (token) fetchProfile();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const res = await fetch(API_ENDPOINTS.PROFILE, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setMessage('Profile updated successfully!');
        setEditing(false);
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (error) return <div className="p-10 text-center text-red-600">{error}</div>;

  return (
    <div className="w-screen min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow p-8">
          <h2 className="text-2xl font-bold mb-6 text-blue-700">My Profile</h2>
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <input type="text" name="name" placeholder="Full Name" value={form.name} onChange={handleChange} className="rounded px-4 py-2 border border-gray-200" disabled={!editing} />
            <input type="number" name="age" placeholder="Age" value={form.age} onChange={handleChange} className="rounded px-4 py-2 border border-gray-200" min="0" max="120" disabled={!editing} />
            <input type="text" name="mobile" placeholder="Mobile" value={form.mobile} onChange={handleChange} className="rounded px-4 py-2 border border-gray-200" maxLength={20} disabled={!editing} />
            <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} className="rounded px-4 py-2 border border-gray-200" disabled readOnly />
            <input type="text" name="city" placeholder="City" value={form.city} onChange={handleChange} className="rounded px-4 py-2 border border-gray-200" maxLength={100} disabled={!editing} />
            <input type="text" name="pinCode" placeholder="PinCode" value={form.pinCode} onChange={handleChange} className="rounded px-4 py-2 border border-gray-200" maxLength={10} disabled={!editing} />
            {message && <div className="text-green-600 text-sm">{message}</div>}
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <div className="flex gap-2 mt-2">
              {editing ? (
                <>
                  <button type="submit" className="bg-blue-700 text-white px-4 py-2 rounded">Save</button>
                  <button type="button" className="bg-gray-200 text-gray-700 px-4 py-2 rounded" onClick={() => setEditing(false)}>Cancel</button>
                </>
              ) : (
                <button type="button" className="bg-blue-700 text-white px-4 py-2 rounded" onClick={() => setEditing(true)}>Edit Profile</button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile; 