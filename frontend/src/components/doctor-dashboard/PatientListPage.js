import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_ENDPOINTS } from '../../utils/api';

const PatientListPage = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('doctorToken');
      try {
        const res = await fetch(API_ENDPOINTS.DOCTOR_PATIENTS, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch patients');
        const data = await res.json();
        setPatients(data.patients || []);
      } catch (err) {
        setError(err.message || 'Error loading patients');
      }
      setLoading(false);
    };
    fetchPatients();
  }, []);

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (error) return <div className="p-10 text-center text-red-600">{error}</div>;

  return (
    <div className="w-full bg-white border border-gray-100 rounded-2xl shadow p-8 flex flex-col gap-6">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">My Patients</h2>
      {patients.length === 0 ? (
        <div className="text-gray-500">No patients found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-blue-100">
                <th className="px-3 py-2 border">Name</th>
                <th className="px-3 py-2 border">Email</th>
                <th className="px-3 py-2 border">Appointments</th>
                <th className="px-3 py-2 border">Profile</th>
              </tr>
            </thead>
            <tbody>
              {patients.map(patient => (
                <tr key={patient.id} className="border-b">
                  <td className="px-3 py-2 border font-semibold text-blue-800">{patient.name}</td>
                  <td className="px-3 py-2 border">{patient.email}</td>
                  <td className="px-3 py-2 border text-center">{patient.appointmentCount}</td>
                  <td className="px-3 py-2 border text-center">
                    <Link to={`/doctor-dashboard/patients/${patient.id}`} className="text-blue-600 hover:underline">View Profile</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PatientListPage; 