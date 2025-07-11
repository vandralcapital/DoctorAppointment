import React, { useState, useEffect } from 'react';
import { FaEdit, FaUser } from 'react-icons/fa';
import { API_ENDPOINTS } from '../../utils/api';
import { Link, Routes, Route, useNavigate } from 'react-router-dom';

const fetchDoctorData = async () => {
  const token = localStorage.getItem('doctorToken');
  const doctorInfoRaw = localStorage.getItem('doctorInfo');
  if (!token || !doctorInfoRaw) return null;
  let doctorInfo;
  try {
    doctorInfo = JSON.parse(doctorInfoRaw);
  } catch {
    return null;
  }
  if (!doctorInfo || !doctorInfo.id) return null;
  const res = await fetch(API_ENDPOINTS.DOCTOR_BY_ID(doctorInfo.id), {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const data = await res.json();
  return data.doctor;
};

const updateDoctorProfile = async (form) => {
  const token = localStorage.getItem('doctorToken');
  const res = await fetch(API_ENDPOINTS.DOCTOR_PROFILE, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(form),
  });
  return res.json();
};

const ProfilePage = () => {
  const [doctor, setDoctor] = useState(null);
  const [editSection, setEditSection] = useState(null);
  const [form, setForm] = useState({});
  const [progress, setProgress] = useState(0);
  const [checklist, setChecklist] = useState({});
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDoctorData().then((doc) => {
      if (!doc) {
        setError('Failed to load profile. Please log in again.');
        setDoctor(null);
        return;
      }
      setDoctor(doc);
      setForm({
        name: doc.name || '',
        email: doc.email || '',
        phone: doc.phone || '',
        location: doc.location || '',
        bio: doc.bio || '',
      });
      calculateProgress(doc);
    });
  }, []);

  const calculateProgress = (doc) => {
    const items = {
      account: !!doc.name && !!doc.email,
      photo: !!doc.avatar,
      personal: !!doc.name && !!doc.email && !!doc.phone,
      location: !!doc.location,
      bio: !!doc.bio,
      notifications: true, // Assume enabled for now
      bank: true, // Assume enabled for now
    };
    setChecklist(items);
    const percent = Math.round((Object.values(items).filter(Boolean).length / Object.keys(items).length) * 100);
    setProgress(percent);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (fields) => {
    const updateFields = fields.reduce((acc, key) => { acc[key] = form[key]; return acc; }, {});
    const res = await updateDoctorProfile(updateFields);
    if (res.doctor) {
      setDoctor(res.doctor);
      setEditSection(null);
      setMessage('Profile updated!');
      setForm({
        name: res.doctor.name || '',
        email: res.doctor.email || '',
        phone: res.doctor.phone || '',
        location: res.doctor.location || '',
        bio: res.doctor.bio || '',
      });
      calculateProgress(res.doctor);
    } else {
      setMessage(res.message || 'Error updating profile.');
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      // Upload to backend
      const formData = new FormData();
      formData.append('avatar', file);
      const token = localStorage.getItem('doctorToken');
      try {
        const res = await fetch(API_ENDPOINTS.DOCTOR_PROFILE_AVATAR, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        const data = await res.json();
        if (res.ok && data.avatar) {
          setDoctor((prev) => ({ ...prev, avatar: data.avatar }));
          setMessage('Profile photo updated!');
        } else {
          setMessage(data.message || 'Error uploading photo.');
        }
      } catch (err) {
        setMessage('Network error uploading photo.');
      }
    }
  };

  if (error) return (
    <div className="p-10 text-center text-red-600">
      {error}
      <br />
      <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={() => window.location.href = '/doctor-login'}>
        Login again
      </button>
    </div>
  );
  if (!doctor) return <div className="p-10 text-center">Loading...</div>;

  const avatarUrl = doctor?.avatar?.startsWith('http')
    ? doctor.avatar
    : doctor?.avatar
      ? `${API_ENDPOINTS.UPLOAD_BASE_URL}/uploads/avatars/${doctor.avatar}`
      : `https://ui-avatars.com/api/?name=${doctor?.name || 'Doctor'}`;

  // Add a new component for Public Profile
  function PublicProfile({ doctor }) {
    if (!doctor) return <div className="p-10 text-center">Loading...</div>;
    return (
      <div className="w-full max-w-3xl mx-auto bg-white rounded-xl shadow p-8 mt-8">
        <div className="flex flex-col items-center gap-4">
          <div className="w-32 h-32 rounded-full bg-blue-200 flex items-center justify-center mb-2">
            <img
              src={doctor?.avatar?.startsWith('http') ? doctor.avatar : doctor?.avatar ? `${API_ENDPOINTS.UPLOAD_BASE_URL}/uploads/avatars/${doctor.avatar}` : `https://ui-avatars.com/api/?name=${doctor?.name || 'Doctor'}`}
              alt="Avatar"
              className="w-28 h-28 rounded-full object-cover border-4 border-white shadow"
            />
          </div>
          <div className="text-2xl font-bold text-gray-900">{doctor?.name}</div>
          <div className="text-blue-700 text-lg font-medium">{doctor?.specialization}</div>
          <div className="text-gray-600">{doctor?.qualification}</div>
          <div className="text-gray-500">{doctor?.location}</div>
          <div className="text-gray-700 mt-4 text-center">{doctor?.bio}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r flex flex-col py-8 px-4">
        <div className="mb-8">
          <div className="text-2xl font-bold text-blue-700 mb-2">Parchi</div>
        </div>
        <nav className="flex-1 flex flex-col gap-2">
          <Link to="/doctor-dashboard/profile" className="py-2 px-4 rounded hover:bg-blue-50 font-medium text-gray-700">Edit Profile</Link>
          <Link to="/doctor-dashboard/public-profile" className="py-2 px-4 rounded hover:bg-blue-50 font-medium text-gray-700">Public Profile</Link>
          <Link to="/doctor-dashboard/appointments" className="py-2 px-4 rounded hover:bg-blue-50 font-medium text-gray-700">New Appointments</Link>
          <Link to="/doctor-dashboard/patients" className="py-2 px-4 rounded hover:bg-blue-50 font-medium text-gray-700">Patients</Link>
        </nav>
        <button onClick={() => { localStorage.removeItem('doctorToken'); window.location.href = '/doctor-login'; }} className="mt-8 py-2 px-4 bg-red-100 text-red-700 rounded font-semibold">Logout</button>
      </div>
      {/* Main Content */}
      <div className="flex-1 bg-gray-50 p-8">
        <Routes>
          <Route path="/doctor-dashboard/profile" element={
            <div className="w-full max-w-5xl flex flex-col md:flex-row gap-8">
              {/* Main Profile Card - single large card */}
              <div className="flex-1 flex flex-col items-center gap-6">
                {/* Profile Photo and Upload */}
                <div className="flex flex-col items-center mb-2">
                  <div className="relative mb-2">
                    <div className="w-36 h-36 rounded-full bg-yellow-300 flex items-center justify-center mb-2">
                      <img
                        src={avatarPreview || avatarUrl}
                        alt="Avatar"
                        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow"
                      />
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="avatar-upload"
                      onChange={handleAvatarChange}
                    />
                    <label htmlFor="avatar-upload" className="absolute bottom-6 right-6 bg-white border border-gray-200 text-blue-600 rounded-full p-2 cursor-pointer shadow">
                      <FaEdit className="text-lg" />
                    </label>
                  </div>
                  <button className="mt-1 px-4 py-2 bg-white border border-gray-200 rounded-lg font-semibold text-gray-700 text-sm shadow">Upload new photo</button>
                  <div className="text-xs text-gray-400 mt-1 text-center">At least 800×800 px recommended.<br/>JPG or PNG is allowed</div>
                  {message && (
                    <div className={`mt-2 text-sm font-medium ${message.toLowerCase().includes('error') ? 'text-red-600' : 'text-green-600'}`}>{message}</div>
                  )}
                </div>
                {/* Single Large Card for all sections */}
                <div className="w-full bg-white border border-gray-100 rounded-2xl shadow p-8 flex flex-col gap-6">
                  {/* Personal Info Row */}
                  <div className="flex flex-col gap-2 relative pb-4 border-b border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-lg">Personal Info</span>
                      {editSection !== 'personal' && <button className="text-gray-500 hover:text-blue-600 font-semibold flex items-center gap-1 absolute top-0 right-0" onClick={() => setEditSection('personal')}><FaEdit className="text-sm" /> Edit</button>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                      <div className="flex flex-col">
                        <label className="block text-gray-500 text-xs mb-1">Full Name</label>
                        {editSection === 'personal' ? (
                          <input type="text" name="name" value={form.name} onChange={handleFormChange} className="w-full border rounded px-3 py-2" />
                        ) : (
                          <div className="font-medium text-gray-800 break-words">{doctor.name}</div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <label className="block text-gray-500 text-xs mb-1">Email</label>
                        <div className="font-medium text-gray-800 break-words">{doctor.email}</div>
                      </div>
                      <div className="flex flex-col">
                        <label className="block text-gray-500 text-xs mb-1">Phone</label>
                        {editSection === 'personal' ? (
                          <input type="text" name="phone" value={form.phone} onChange={handleFormChange} className="w-full border rounded px-3 py-2" />
                        ) : (
                          <div className="font-medium text-gray-800 break-words">{doctor.phone || '-'}</div>
                        )}
                      </div>
                    </div>
                    {editSection === 'personal' && (
                      <div className="flex gap-2 mt-2 justify-end">
                        <button type="button" className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => handleSave(['name', 'phone'])}>Save changes</button>
                        <button type="button" className="bg-gray-200 text-gray-700 px-4 py-2 rounded" onClick={() => { setEditSection(null); setForm(doctor); }}>Cancel</button>
                      </div>
                    )}
                  </div>
                  {/* Location Row */}
                  <div className="flex flex-col gap-2 relative pb-4 border-b border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-lg">Location</span>
                      {editSection !== 'location' && <button className="text-gray-500 hover:text-blue-600 font-semibold flex items-center gap-1 absolute top-0 right-0" onClick={() => setEditSection('location')}><FaEdit className="text-sm" /> Edit</button>}
                    </div>
                    {editSection === 'location' ? (
                      <div className="flex gap-2 items-center justify-end">
                        <div className="relative w-full md:w-1/2">
                          <span className="absolute left-3 top-2.5 text-gray-400"><FaUser /></span>
                          <input type="text" name="location" value={form.location} onChange={handleFormChange} className="w-full border rounded pl-10 px-3 py-2" />
                        </div>
                        <button type="button" className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => handleSave(['location'])}>Save changes</button>
                        <button type="button" className="bg-gray-200 text-gray-700 px-4 py-2 rounded" onClick={() => { setEditSection(null); setForm(doctor); }}>Cancel</button>
                      </div>
                    ) : (
                      <div className="font-medium text-gray-800">{doctor.location || '-'}</div>
                    )}
                  </div>
                  {/* Bio Row */}
                  <div className="flex flex-col gap-2 relative">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-lg">Bio</span>
                      {editSection !== 'bio' && <button className="text-gray-500 hover:text-blue-600 font-semibold flex items-center gap-1 absolute top-0 right-0" onClick={() => setEditSection('bio')}><FaEdit className="text-sm" /> Edit</button>}
                    </div>
                    {editSection === 'bio' ? (
                      <div className="flex flex-col gap-2">
                        <textarea name="bio" value={form.bio} onChange={handleFormChange} className="w-full border rounded px-3 py-2 min-h-[80px]" />
                        <div className="flex gap-2 justify-end">
                          <button type="button" className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => handleSave(['bio'])}>Save changes</button>
                          <button type="button" className="bg-gray-200 text-gray-700 px-4 py-2 rounded" onClick={() => { setEditSection(null); setForm(doctor); }}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-700 whitespace-pre-line">{doctor.bio || '-'}</div>
                    )}
                  </div>
                </div>
              </div>
              {/* Profile Progress & Checklist */}
              <div className="w-full md:w-80 flex flex-col gap-6">
                <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center">
                  <div className="w-32 h-32 relative flex items-center justify-center">
                    <svg className="absolute top-0 left-0" width="128" height="128">
                      <circle cx="64" cy="64" r="60" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                      <circle cx="64" cy="64" r="60" stroke="#22c55e" strokeWidth="8" fill="none" strokeDasharray="377" strokeDashoffset={377 - (progress / 100) * 377} strokeLinecap="round" />
                    </svg>
                    <span className="text-3xl font-bold text-green-600">{progress}%</span>
                  </div>
                  <div className="mt-4 text-gray-600 font-semibold">Complete your profile</div>
                </div>
                <div className="bg-white rounded-2xl shadow p-6">
                  <div className="font-bold mb-4">Checklist</div>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2"><span className={checklist.account ? 'text-green-500' : 'text-gray-400'}>✔</span> Setup account <span className="ml-auto text-xs text-gray-400">10%</span></li>
                    <li className="flex items-center gap-2"><span className={checklist.photo ? 'text-green-500' : 'text-gray-400'}>✔</span> Upload your photo <span className="ml-auto text-xs text-gray-400">5%</span></li>
                    <li className="flex items-center gap-2"><span className={checklist.personal ? 'text-green-500' : 'text-gray-400'}>✔</span> Personal Info <span className="ml-auto text-xs text-gray-400">10%</span></li>
                    <li className="flex items-center gap-2"><span className={checklist.location ? 'text-green-500' : 'text-gray-400'}>✔</span> Location <span className="ml-auto text-xs text-green-500">+20%</span></li>
                    <li className="flex items-center gap-2"><span className={checklist.bio ? 'text-green-500' : 'text-gray-400'}>✔</span> Biography <span className="ml-auto text-xs text-green-500">15%</span></li>
                    <li className="flex items-center gap-2"><span className={checklist.notifications ? 'text-green-500' : 'text-gray-400'}>✔</span> Notifications <span className="ml-auto text-xs text-green-500">+10%</span></li>
                    <li className="flex items-center gap-2"><span className={checklist.bank ? 'text-green-500' : 'text-gray-400'}>✔</span> Bank details <span className="ml-auto text-xs text-green-500">+30%</span></li>
                  </ul>
                </div>
              </div>
            </div>
          } />
          <Route path="/doctor-dashboard/public-profile" element={<PublicProfile doctor={doctor} />} />
          {/* ...other routes... */}
        </Routes>
      </div>
    </div>
  );
};

export default ProfilePage; 