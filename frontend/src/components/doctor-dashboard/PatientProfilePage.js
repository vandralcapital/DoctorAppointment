// PatientProfilePage.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const PatientProfilePage = () => {
  const { patientId } = useParams();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPatientData = async () => {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('doctorToken');
      try {
        // Fetch patient info
        const patientRes = await fetch(`http://localhost:5050/api/doctors/patients/${patientId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!patientRes.ok) throw new Error('Failed to fetch patient info');
        const patientData = await patientRes.json();
        setPatient(patientData.patient);

        // Fetch appointment history
        const apptRes = await fetch(`http://localhost:5050/api/doctors/patients/${patientId}/appointments`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!apptRes.ok) throw new Error('Failed to fetch appointments');
        const apptData = await apptRes.json();
        setAppointments(apptData.appointments || []);
      } catch (err) {
        setError(err.message || 'Error loading patient profile');
      }
      setLoading(false);
    };
    fetchPatientData();
  }, [patientId]);

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (error) return <div className="p-10 text-center text-red-600">{error}</div>;
  if (!patient) return <div className="p-10 text-center">Patient not found.</div>;

  return (
    <div className="w-full bg-white border border-gray-100 rounded-2xl shadow p-8 flex flex-col gap-6">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">Patient Profile</h2>
      <div className="mb-6">
        <div className="font-semibold text-lg">{patient.name}</div>
        <div className="text-gray-600">{patient.email}</div>
      </div>
      <div>
        <h3 className="font-semibold text-lg mb-2">Appointment History</h3>
        {appointments.length === 0 ? (
          <div className="text-gray-500">No appointments found with this patient.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-blue-100">
                  <th className="px-3 py-2 border">Date</th>
                  <th className="px-3 py-2 border">Time</th>
                  <th className="px-3 py-2 border">Treatment</th>
                  <th className="px-3 py-2 border">Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(appt => (
                  <tr key={appt._id} className="border-b">
                    <td className="px-3 py-2 border">{appt.date}</td>
                    <td className="px-3 py-2 border">{appt.time}</td>
                    <td className="px-3 py-2 border">{appt.treatment}</td>
                    <td className="px-3 py-2 border">{appt.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientProfilePage; 