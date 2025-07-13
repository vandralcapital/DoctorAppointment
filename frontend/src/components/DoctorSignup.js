import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../utils/api';
import indiaLocationData from '../utils/indiaLocations';

const qualificationOptions = [
  { value: '', label: 'Select Qualification' },
  { value: 'MBBS', label: 'MBBS - Bachelor of Medicine and Bachelor of Surgery' },
  { value: 'BDS', label: 'BDS - Bachelor of Dental Surgery' },
  { value: 'BAMS', label: 'BAMS - Bachelor of Ayurvedic Medicine and Surgery' },
  { value: 'BHMS', label: 'BHMS - Bachelor of Homeopathic Medicine and Surgery' },
  { value: 'BUMS', label: 'BUMS - Bachelor of Unani Medicine and Surgery' },
  { value: 'BNYS', label: 'BNYS - Bachelor of Naturopathy and Yogic Sciences' },
  { value: 'BSMS', label: 'BSMS - Bachelor of Siddha Medicine and Surgery' },
  { value: 'BVSc', label: 'BVSc - Bachelor of Veterinary Science' },
  { value: 'MD', label: 'MD - Doctor of Medicine' },
  { value: 'MS', label: 'MS - Master of Surgery' },
  { value: 'DNB', label: 'DNB - Diplomate of National Board' },
  { value: 'MDS', label: 'MDS - Master of Dental Surgery' },
  { value: 'DM', label: 'DM - Doctorate of Medicine (Super Specialty)' },
  { value: 'MCh', label: 'MCh - Magister Chirurgiae (Master of Surgery, Super Specialty)' },
  { value: 'FNB', label: 'FNB - Fellow of National Board' },
  { value: 'MBChB', label: 'MBChB / MB BCh - Bachelor of Medicine and Bachelor of Surgery (UK/SA/NZ)' },
  { value: 'DO', label: 'DO - Doctor of Osteopathic Medicine (US)' },
  { value: 'FRCS', label: 'FRCS - Fellow of the Royal College of Surgeons (UK)' },
  { value: 'MRCP', label: 'MRCP - Member of Royal College of Physicians (UK)' },
  { value: 'MRCS', label: 'MRCS - Member of Royal College of Surgeons (UK)' },
  { value: 'USMLE', label: 'USMLE - United States Medical Licensing Examination' },
];

const specializationOptions = [
  { value: '', label: 'Select Specialization' },
  { value: 'General Medicine', label: 'General Medicine' },
  { value: 'Pediatrics', label: 'Pediatrics' },
  { value: 'Cardiology', label: 'Cardiology' },
  { value: 'Dermatology', label: 'Dermatology' },
  { value: 'Orthopedics', label: 'Orthopedics' },
  { value: 'Gynecology', label: 'Gynecology' },
  { value: 'Psychiatry', label: 'Psychiatry' },
  { value: 'ENT', label: 'ENT' },
  { value: 'Ophthalmology', label: 'Ophthalmology' },
  { value: 'Radiology', label: 'Radiology' },
  { value: 'Anesthesiology', label: 'Anesthesiology' },
  { value: 'General Surgery', label: 'General Surgery' },
  { value: 'Neurology', label: 'Neurology' },
  { value: 'Nephrology', label: 'Nephrology' },
  { value: 'Oncology', label: 'Oncology' },
  { value: 'Urology', label: 'Urology' },
  { value: 'Gastroenterology', label: 'Gastroenterology' },
];

const departmentOptions = [
  { value: '', label: 'Select Department' },
  { value: 'General', label: 'General' },
  { value: 'Cardiology', label: 'Cardiology' },
  { value: 'Neurology', label: 'Neurology' },
  { value: 'Orthopedics', label: 'Orthopedics' },
  { value: 'Pediatrics', label: 'Pediatrics' },
  { value: 'Oncology', label: 'Oncology' },
  { value: 'Gynecology', label: 'Gynecology' },
  { value: 'Dermatology', label: 'Dermatology' },
  { value: 'Other', label: 'Other' },
];

const DoctorSignup = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    qualification: '',
    specialization: '',
    hospitalName: '',
    department: '',
    contactNumber: '',
    addressLine1: '',
    addressLine2: '',
    pinCode: '',
    city: '',
    state: '',
    district: '',
    experience: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(API_ENDPOINTS.DOCTOR_SIGNUP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Doctor account created successfully!');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.message || 'Signup failed.');
      }
    } catch (err) {
      setError('Network error.');
    }
    setLoading(false);
  };

  // Derived options for dropdowns
  const stateOptions = indiaLocationData.map(s => ({ value: s.state, label: s.state }));
  const selectedState = indiaLocationData.find(s => s.state === form.state);
  const districtOptions = selectedState ? selectedState.districts.map(d => ({ value: d.district, label: d.district })) : [];
  const selectedDistrict = selectedState && form.district ? selectedState.districts.find(d => d.district === form.district) : null;
  const cityOptions = selectedDistrict ? selectedDistrict.cities.map(c => ({ value: c, label: c })) : [];

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-blue-700">Doctor Sign Up</h2>
        {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 p-2 rounded mb-4">{success}</div>}
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Name</label>
          <input type="text" name="name" value={form.name} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Hospital Name</label>
          <input type="text" name="hospitalName" value={form.hospitalName} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Qualification</label>
          <select name="qualification" value={form.qualification} onChange={handleChange} required className="w-full border rounded px-3 py-2">
            {qualificationOptions.map((q) => (
              <option key={q.value} value={q.value}>{q.label}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Specialization</label>
          <select name="specialization" value={form.specialization} onChange={handleChange} required className="w-full border rounded px-3 py-2">
            {specializationOptions.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Department</label>
          <select name="department" value={form.department} onChange={handleChange} className="w-full border rounded px-3 py-2">
            {departmentOptions.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Contact Number</label>
          <input type="text" name="contactNumber" value={form.contactNumber} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Password</label>
          <input type="password" name="password" value={form.password} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Address Line 1</label>
          <input type="text" name="addressLine1" value={form.addressLine1} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Address Line 2</label>
          <input type="text" name="addressLine2" value={form.addressLine2} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Pin Code</label>
          <input type="text" name="pinCode" value={form.pinCode} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">State</label>
          <select name="state" value={form.state} onChange={handleChange} className="w-full border rounded px-3 py-2">
            <option value="">Select State</option>
            {stateOptions.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        {form.state && (
          <div className="mb-4">
            <label className="block mb-1 font-semibold">District</label>
            <select name="district" value={form.district} onChange={handleChange} className="w-full border rounded px-3 py-2">
              <option value="">Select District</option>
              {districtOptions.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>
        )}
        {form.state && form.district && (
          <div className="mb-4">
            <label className="block mb-1 font-semibold">City</label>
            <select name="city" value={form.city} onChange={handleChange} className="w-full border rounded px-3 py-2">
              <option value="">Select City</option>
              {cityOptions.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        )}
        <div className="mb-6">
          <label className="block mb-1 font-semibold">Experience (years)</label>
          <input type="number" name="experience" value={form.experience} onChange={handleChange} min="0" max="60" className="w-full border rounded px-3 py-2" />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-blue-700 text-white py-2 rounded font-semibold hover:bg-blue-800 transition">
          {loading ? 'Signing Up...' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
};

export default DoctorSignup; 