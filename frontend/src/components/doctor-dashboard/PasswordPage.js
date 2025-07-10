import React, { useState } from 'react';

// Password strength checker
function getPasswordStrength(password) {
  if (!password || password.length < 6) return 'weak';
  if (/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{6,}$/.test(password)) {
    if (/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[^a-zA-Z\d])[A-Za-z\d[^a-zA-Z\d]]{8,}$/.test(password)) {
      return 'strong';
    }
    return 'medium';
  }
  return 'weak';
}

const PasswordPage = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const passwordStrength = getPasswordStrength(newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (passwordStrength === 'weak') {
      setError('Password is too weak.');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('doctorToken');
      const res = await fetch('http://localhost:5050/api/doctors/change-password', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Password changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(data.message || 'Failed to change password.');
      }
    } catch (err) {
      setError('Network error.');
    }
    setLoading(false);
  };

  return (
    <div className="w-full bg-white border border-gray-100 rounded-2xl shadow p-8 flex flex-col gap-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">Change Password</h2>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-gray-600 mb-1 font-medium">Current Password</label>
          <input
            type="password"
            className="w-full border rounded px-3 py-2"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-gray-600 mb-1 font-medium">New Password</label>
          <input
            type="password"
            className="w-full border rounded px-3 py-2"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
          />
          {newPassword && (
            <div className={`mt-1 text-sm font-medium ${passwordStrength === 'weak' ? 'text-red-600' : passwordStrength === 'medium' ? 'text-yellow-600' : 'text-green-600'}`}>Password strength: {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}</div>
          )}
        </div>
        <div>
          <label className="block text-gray-600 mb-1 font-medium">Confirm New Password</label>
          <input
            type="password"
            className="w-full border rounded px-3 py-2"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        {error && <div className="text-red-600 font-medium text-sm">{error}</div>}
        {message && <div className="text-green-600 font-medium text-sm">{message}</div>}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded font-semibold mt-2 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? 'Changing...' : 'Change Password'}
        </button>
      </form>
    </div>
  );
};

export default PasswordPage; 