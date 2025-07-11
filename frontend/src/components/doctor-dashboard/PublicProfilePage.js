import React, { useEffect, useState } from 'react';

const PublicProfilePage = () => {
  const [doctor, setDoctor] = useState(null);
  useEffect(() => {
    const doctorInfoRaw = localStorage.getItem('doctorInfo');
    if (doctorInfoRaw) {
      setDoctor(JSON.parse(doctorInfoRaw));
    }
  }, []);
  if (!doctor) return <div className="p-10 text-center">Loading...</div>;
  return (
    <div className="w-full max-w-5xl mx-auto bg-white rounded-xl shadow p-8 mt-8">
      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
        <div className="flex flex-col items-center md:items-start gap-4 md:w-1/3">
          <div className="w-32 h-32 rounded-full bg-blue-200 flex items-center justify-center mb-2">
            <img
              src={doctor.avatar?.startsWith('http') ? doctor.avatar : doctor.avatar ? `/uploads/avatars/${doctor.avatar}` : `https://ui-avatars.com/api/?name=${doctor.name}`}
              alt="Avatar"
              className="w-28 h-28 rounded-full object-cover border-4 border-white shadow"
            />
          </div>
          <div className="text-2xl font-bold text-gray-900">{doctor.name}</div>
          <div className="text-blue-700 text-lg font-medium">{doctor.specialization}</div>
          <div className="text-gray-600">{doctor.qualification}</div>
          <div className="text-gray-500">{doctor.location}</div>
        </div>
        <div className="flex-1 flex flex-col gap-6">
          <div className="bg-gray-50 rounded-xl p-6 shadow-inner">
            <div className="font-bold text-lg mb-2">About</div>
            <div className="text-gray-700 whitespace-pre-line">{doctor.bio || 'No bio provided.'}</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-6 shadow-inner">
            <div className="font-bold text-lg mb-2">Contact</div>
            <div className="text-gray-700">Email: {doctor.email}</div>
            <div className="text-gray-700">Phone: {doctor.phone || '-'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfilePage; 