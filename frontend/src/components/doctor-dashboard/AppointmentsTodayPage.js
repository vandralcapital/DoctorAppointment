import React, { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../../utils/api';

const AppointmentsTodayPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allAppointments, setAllAppointments] = useState([]);
  const [prescriptionModal, setPrescriptionModal] = useState({ open: false, appt: null });
  const [prescriptionText, setPrescriptionText] = useState('');
  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAppointments = async () => {
      const token = localStorage.getItem('doctorToken');
      const res = await fetch(API_ENDPOINTS.DOCTOR_APPOINTMENTS, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      setAllAppointments(data.appointments || []);
      const today = new Date().toISOString().slice(0, 10);
      const filtered = (data.appointments || []).filter(appt => {
        // If appt.date is already in YYYY-MM-DD format, compare as string
        if (appt.date && appt.date.length === 10 && appt.date[4] === '-' && appt.date[7] === '-') {
          return appt.date === today;
        }
        // Otherwise, try to parse as Date
        const apptDate = new Date(appt.date);
        return !isNaN(apptDate) && apptDate.toISOString().slice(0, 10) === today;
      });
      setAppointments(filtered);
      setLoading(false);
    };
    fetchAppointments();
  }, []);

  async function handleSavePrescription() {
    if (!prescriptionModal.appt) return;
    setSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('doctorToken');
      const formData = new FormData();
      if (prescriptionFile) formData.append('file', prescriptionFile);
      if (prescriptionText) formData.append('text', prescriptionText);
      const res = await fetch(`${API_ENDPOINTS.DOCTOR_APPOINTMENTS}/${prescriptionModal.appt._id}/prescription`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (!res.ok) throw new Error('Failed to save prescription');
      // Optionally update appointment in state
      setPrescriptionModal({ open: false, appt: null });
      setPrescriptionText('');
      setPrescriptionFile(null);
      // Optionally refetch appointments
      window.location.reload();
    } catch (e) {
      setError(e.message || 'Error saving prescription');
    }
    setSaving(false);
  }

  function getPrescriptionUrl(appt) {
    if (appt.prescriptionFile) {
      return `${API_ENDPOINTS.UPLOADS_PRESCRIPTIONS}/${appt.prescriptionFile}`;
    }
    return null;
  }

  return (
    <div className="w-full bg-white border border-gray-100 rounded-2xl shadow p-8 flex flex-col gap-6">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">Today's Appointments</h2>
      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : appointments.length === 0 ? (
        <div className="text-gray-500">No appointments scheduled for today.</div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {appointments.map(appt => (
            <li key={appt._id} className="py-4 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-semibold text-lg text-blue-700">{appt.patientName}</div>
                <div className="text-gray-500 text-sm">{appt.treatment}</div>
              </div>
              <div className="flex gap-4 mt-2 md:mt-0 items-center">
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg font-semibold text-sm">{appt.time}</span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg font-medium text-sm">{appt.status}</span>
                <button
                  onClick={() => {
                    console.log('Opening prescription modal for appointment:', appt);
                    setPrescriptionModal({ open: true, appt });
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition"
                >
                  {appt.prescriptionFile || appt.prescriptionText ? 'View/Edit Prescription' : 'Add Prescription'}
                </button>
                {appt.prescriptionFile && (
                  <a href={getPrescriptionUrl(appt)} target="_blank" rel="noopener noreferrer" className="ml-2 bg-green-600 text-white px-3 py-1 rounded">Download</a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      {/* Prescription Modal */}
      {prescriptionModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 relative animate-fade-in flex flex-col gap-4">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold z-10" onClick={() => setPrescriptionModal({ open: false, appt: null })}>&times;</button>
            <div className="mb-2">
              <h3 className="text-2xl font-bold text-gray-900 mb-1">Upload a Prescription</h3>
              <div className="text-gray-500 text-sm">Attach a PDF/image or write a prescription below.</div>
            </div>
            {/* Drag-and-drop file upload */}
            <label htmlFor="prescription-upload" className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 py-8 cursor-pointer hover:border-blue-400 transition mb-2">
              <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4m0 0V8m0 4h4m-4 0H8m12 4a4 4 0 01-4 4H8a4 4 0 01-4-4V8a4 4 0 014-4h8a4 4 0 014 4v8z" /></svg>
              <span className="text-gray-500">{prescriptionFile ? prescriptionFile.name : 'Upload a PDF or image (max 10MB)'}</span>
              <input id="prescription-upload" type="file" accept=".pdf,image/*" className="hidden" onChange={e => setPrescriptionFile(e.target.files[0])} />
              {prescriptionFile && (
                <button type="button" onClick={() => setPrescriptionFile(null)} className="mt-2 text-xs text-red-500 underline">Remove file</button>
              )}
            </label>
            <div className="mb-2">
              <label className="block font-semibold mb-1">Or Write Prescription</label>
              <textarea value={prescriptionText} onChange={e => setPrescriptionText(e.target.value)} rows={5} className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-100" placeholder="Write prescription here..." />
            </div>
            {error && <div className="text-red-600 mb-2">{error}</div>}
            <div className="flex items-center justify-between mt-4 gap-2">
              <button onClick={() => setPrescriptionModal({ open: false, appt: null })} className="px-5 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition">Cancel</button>
              <div className="flex gap-2">
                <button onClick={handleSavePrescription} disabled={saving} className="px-5 py-2 rounded-lg bg-blue-700 text-white font-semibold shadow hover:bg-blue-800 transition">{saving ? 'Saving...' : 'Save'}</button>
                {prescriptionFile && (
                  <a href={URL.createObjectURL(prescriptionFile)} download className="px-5 py-2 rounded-lg bg-green-600 text-white font-semibold shadow hover:bg-green-700 transition">Download</a>
                )}
              </div>
            </div>
            {/* Status indicator */}
            {(prescriptionFile || prescriptionText) && !saving && (
              <div className="mt-2 text-green-600 text-sm flex items-center gap-2"><span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span> Saved as draft</div>
            )}
          </div>
        </div>
      )}
      {/* Debug Panel: Show all appointments for this doctor in a table */}
      {/* (Removed debug panel) */}
    </div>
  );
};

export default AppointmentsTodayPage; 