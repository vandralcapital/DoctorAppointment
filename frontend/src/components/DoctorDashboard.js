import React, { useState, useEffect } from 'react';
import { FaUser, FaCalendarCheck, FaUsers } from 'react-icons/fa';
import { HiOutlineSearch } from 'react-icons/hi';
import { Link, Outlet, useLocation, Routes, Route } from 'react-router-dom';
import AvatarDropdown from './AvatarDropdown';
import { useAuth } from '../context/AuthContext';
import PatientProfilePage from './doctor-dashboard/PatientProfilePage';
import PatientListPage from './doctor-dashboard/PatientListPage';

const fetchDoctorData = async () => {
  const token = localStorage.getItem('doctorToken');
  const res = await fetch('http://localhost:5050/api/doctors/' + JSON.parse(localStorage.getItem('doctorInfo')).id, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const data = await res.json();
  return data.doctor;
};

const updateDoctorProfile = async (form) => {
  const token = localStorage.getItem('doctorToken');
  const res = await fetch('http://localhost:5050/api/doctors/profile', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(form),
  });
  return res.json();
};

const sidebarSections = [
  { group: 'Main', items: [
    { label: 'Edit Profile', icon: <FaUser />, route: '/doctor-dashboard/profile' },
    { label: 'New Appointments', icon: <FaCalendarCheck />, route: '/doctor-dashboard/appointments-today' },
    { label: 'Patients', icon: <FaUsers />, route: '/doctor-dashboard/patients' },
  ]},
];

const DoctorDashboard = () => {
  const [doctor, setDoctor] = useState(null);
  const [editSection, setEditSection] = useState(null);
  const [form, setForm] = useState({});
  const [progress, setProgress] = useState(0);
  const [checklist, setChecklist] = useState({});
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [message, setMessage] = useState('');
  const location = useLocation();
  const { logout } = useAuth();
  const isDoctor = !!localStorage.getItem('doctorToken');
  const doctorInfo = localStorage.getItem('doctorInfo') ? JSON.parse(localStorage.getItem('doctorInfo')) : null;

  useEffect(() => {
    fetchDoctorData().then((doc) => {
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
        const res = await fetch('http://localhost:5050/api/doctors/profile/avatar', {
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

  if (!doctor) return <div className="p-10 text-center">Loading...</div>;

  const avatarUrl = doctor.avatar?.startsWith('http')
    ? doctor.avatar
    : doctor.avatar
      ? `http://localhost:5050/uploads/avatars/${doctor.avatar}`
      : `https://ui-avatars.com/api/?name=${doctor.name}`;

  return (
    <div className="flex bg-[#f6f8fb] min-h-screen">
      {/* Sidebar */}
      <aside className="w-80 bg-white shadow flex flex-col py-8 px-6 min-h-screen rounded-3xl m-4">
        <h2 className="text-xl font-bold mb-8 flex items-center gap-2">
          <span className="inline-block w-7 h-7 bg-blue-600 rounded-full mr-2"></span>
          Parchi
        </h2>
        <div className="flex-1 flex flex-col gap-6">
          {sidebarSections.map((section, idx) => (
            <div key={section.group}>
              <div className="text-xs font-bold text-gray-400 mb-2 ml-2">{section.group}</div>
              <ul className="space-y-1">
                {section.items.map((item, i) => (
                  <li key={item.label}>
                    <Link
                      to={item.route}
                      className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition ${location.pathname === item.route ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <button className="flex items-center gap-3 px-4 py-2 rounded-lg font-medium text-red-500 hover:bg-red-50 w-full">
            Delete account
          </button>
        </div>
        <div className="mt-2">
          <button
            className="flex items-center gap-3 px-4 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-100 w-full"
            onClick={() => { logout(); window.location.href = '/'; }}
          >
            <span className="text-lg">🚪</span> Logout
          </button>
        </div>
      </aside>
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <nav className="w-full flex items-center justify-between px-10 py-4 bg-white shadow-sm rounded-b-3xl">
          <div className="flex items-center gap-4">
            <div className="relative">
              <input type="text" placeholder="Search" className="px-4 py-2 rounded-lg border bg-gray-50 w-72 pl-10" />
              <HiOutlineSearch className="absolute left-3 top-2.5 text-gray-400 text-lg" />
            </div>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded ml-2">⌘F</span>
          </div>
          <div className="flex items-center gap-6">
            <AvatarDropdown isDoctor={isDoctor} doctorInfo={doctorInfo} logout={logout} />
          </div>
        </nav>
        {/* Profile Area */}
        <main className="flex-1 flex flex-col items-center py-12 px-8 bg-[#f6f8fb]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DoctorDashboard; 