import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaHome, FaCalendarCheck, FaPlusCircle, FaUser, FaFileCsv } from 'react-icons/fa';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

const MyAppointments = () => {
  const { user, token } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const pageSize = 10;
  const navigate = useNavigate();
  const [showFilter, setShowFilter] = useState(false);
  const [showColumns, setShowColumns] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [sortDesc, setSortDesc] = useState(true);
  const [visibleColumns, setVisibleColumns] = useState({
    date: true,
    time: true,
    treatment: true,
    doctor: true,
    duration: true,
    status: true,
    actions: true,
  });

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050';

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/auth/my-appointments', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.success) {
          setAppointments(data.appointments);
        } else {
          setError(data.message || 'Failed to fetch appointments');
        }
      } catch (err) {
        setError('Failed to fetch appointments');
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchAppointments();
  }, [token]);

  const location = useLocation();

  const sidebarLinks = [
    { label: 'Dashboard', icon: <FaHome />, route: '/dashboard' },
    { label: 'My Appointments', icon: <FaCalendarCheck />, route: '/my-appointments' },
    { label: 'Book Appointment', icon: <FaPlusCircle />, route: '/book-appointment' },
    { label: 'Profile', icon: <FaUser />, route: '/profile' },
  ];

  // Unique doctor names for filter
  const doctorOptions = useMemo(() => {
    const set = new Set(appointments.map(a => a.doctor?.name).filter(Boolean));
    return Array.from(set);
  }, [appointments]);

  // Filtered and sorted appointments
  const filteredAppointments = useMemo(() => {
    let result = appointments;
    if (search) {
      result = result.filter(appt =>
        (appt.doctor?.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (appt.treatment || "").toLowerCase().includes(search.toLowerCase()) ||
        (appt.status || "").toLowerCase().includes(search.toLowerCase()) ||
        (appt.date || "").toLowerCase().includes(search.toLowerCase())
      );
    }
    if (selectedStatus) {
      result = result.filter(a => a.status === selectedStatus);
    }
    if (selectedDoctor) {
      result = result.filter(a => a.doctor?.name === selectedDoctor);
    }
    result = result.slice().sort((a, b) => sortDesc ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date));
    return result;
  }, [appointments, search, selectedStatus, selectedDoctor, sortDesc]);

  // Group appointments by date
  const groupedAppointments = useMemo(() => {
    const groups = {};
    filteredAppointments.forEach(appt => {
      const date = appt.date;
      if (!groups[date]) groups[date] = [];
      groups[date].push(appt);
    });
    return Object.entries(groups)
      .sort((a, b) => sortDesc ? new Date(b[0]) - new Date(a[0]) : new Date(a[0]) - new Date(b[0]))
      .map(([date, appts]) => ({ date, appointments: appts }));
  }, [filteredAppointments, sortDesc]);

  // Pagination
  const totalAppointments = filteredAppointments.length;
  const totalPages = Math.ceil(totalAppointments / pageSize);
  const pagedGroups = useMemo(() => {
    let count = 0;
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const result = [];
    for (const group of groupedAppointments) {
      const groupAppts = [];
      for (const appt of group.appointments) {
        if (count >= start && count < end) {
          groupAppts.push(appt);
        }
        count++;
      }
      if (groupAppts.length > 0) {
        result.push({ date: group.date, appointments: groupAppts });
      }
      if (count >= end) break;
    }
    return result;
  }, [groupedAppointments, currentPage, pageSize]);

  // Export CSV
  function exportCSV() {
    const cols = Object.keys(visibleColumns).filter(k => visibleColumns[k] && k !== 'actions');
    const header = cols.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(',');
    const rows = filteredAppointments.map(appt =>
      cols.map(col => {
        if (col === 'doctor') return appt.doctor?.name || '';
        if (col === 'treatment') return appt.treatment || appt.service || '';
        return appt[col] || '';
      }).join(',')
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'appointments.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  function getPrescriptionUrl(appt) {
    if (appt.prescriptionFile) {
      return `${API_BASE_URL}/uploads/prescriptions/${appt.prescriptionFile}`;
    }
    return null;
  }

  return (
    <div className="flex bg-[#f6f8fb] min-h-screen">
      {/* Sidebar */}
      <aside className="w-72 bg-white shadow flex flex-col py-8 px-6 min-h-screen rounded-3xl m-4">
        <h2 className="text-xl font-bold mb-8 flex items-center gap-2">
          <span className="inline-block w-7 h-7 bg-blue-600 rounded-full mr-2"></span>
          Parchi
        </h2>
        <ul className="flex-1 flex flex-col gap-2">
          {sidebarLinks.map((item) => (
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
      </aside>
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <Navbar minimal={true} />
        <div className="max-w-6xl mx-auto p-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
              <div className="text-2xl font-bold text-gray-800">Appointments</div>
              <div className="flex gap-2">
                <button onClick={exportCSV} className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-700 font-medium shadow-sm hover:bg-gray-50">
                  <FaFileCsv className="text-blue-600" /> Export CSV
                </button>
                <button onClick={() => navigate('/book-appointment')} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow">
                  <FaPlusCircle /> Add Appointment
                </button>
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
              <div className="relative w-full md:w-96">
                <input
                  type="text"
                  placeholder="Search for appointments"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
                <svg className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowFilter(true)} className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-700 font-medium shadow-sm hover:bg-gray-50">Filters</button>
                <button onClick={() => setSortDesc(s => !s)} className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-700 font-medium shadow-sm hover:bg-gray-50">Last Appointment Date {sortDesc ? '▼' : '▲'}</button>
                <button onClick={() => setShowColumns(true)} className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-700 font-medium shadow-sm hover:bg-gray-50">Add to Table</button>
              </div>
            </div>
            <div className="overflow-x-auto rounded-lg">
              <table className="min-w-full bg-[#f8fafc] rounded-lg">
                <thead>
                  <tr className="text-gray-500 text-sm">
                    <th className="py-3 px-4 text-left font-medium">Date</th>
                    <th className="py-3 px-4 text-left font-medium">Time</th>
                    <th className="py-3 px-4 text-left font-medium">Service</th>
                    <th className="py-3 px-4 text-left font-medium">Doctor</th>
                    <th className="py-3 px-4 text-left font-medium">Duration</th>
                    <th className="py-3 px-4 text-left font-medium">Status</th>
                    <th className="py-3 px-4 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={7} className="text-center py-8 text-gray-400">Loading...</td></tr>
                  ) : error ? (
                    <tr><td colSpan={7} className="text-center py-8 text-red-500">{error}</td></tr>
                  ) : pagedGroups.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-8 text-gray-400">No appointments found.</td></tr>
                  ) : (
                    pagedGroups.map((group, idx) => (
                      <React.Fragment key={group.date}>
                        <tr className="bg-white">
                          <td colSpan={7} className="py-2 px-4 text-gray-700 font-semibold border-t border-b">{group.date}</td>
                        </tr>
                        {group.appointments.map((appt, i) => (
                          <tr key={i} className="hover:bg-blue-50 transition">
                            <td className="py-3 px-4">{appt.date}</td>
                            <td className="py-3 px-4">{appt.time}</td>
                            <td className="py-3 px-4">{appt.treatment || appt.service || '-'}</td>
                            <td className="py-3 px-4">{appt.doctor?.name || '-'}</td>
                            <td className="py-3 px-4">{appt.duration || '-'}</td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${appt.status === 'Pending' ? 'border-yellow-300 bg-yellow-50 text-yellow-700' : appt.status === 'Completed' ? 'border-green-300 bg-green-50 text-green-700' : 'border-gray-300 bg-gray-50 text-gray-700'} text-xs font-semibold`}>
                                <span className={`w-2 h-2 rounded-full ${appt.status === 'Pending' ? 'bg-yellow-400' : appt.status === 'Completed' ? 'bg-green-400' : 'bg-gray-400'}`}></span> {appt.status}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <button onClick={() => { setSelectedAppointment(appt); setModalOpen(true); }} className="bg-white border border-gray-200 rounded-lg px-3 py-1 text-blue-600 font-medium shadow-sm hover:bg-blue-50">View Appointment</button>
                              {appt.prescriptionFile && (
                                <a href={getPrescriptionUrl(appt)} target="_blank" rel="noopener noreferrer" className="ml-2 bg-green-600 text-white px-3 py-1 rounded">Download Prescription</a>
                              )}
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-between mt-6 text-sm text-gray-500">
              <div>Showing <span className="font-semibold">{Math.min(pageSize, totalAppointments - (currentPage - 1) * pageSize)}</span> out of <span className="font-semibold">{totalAppointments}</span> Appointments</div>
              <div className="flex gap-1">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="w-8 h-8 rounded bg-white border border-gray-200 text-gray-700 hover:bg-blue-50 disabled:opacity-50">&lt;</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, currentPage - 2), currentPage + 2).map(page => (
                  <button key={page} onClick={() => setCurrentPage(page)} className={`w-8 h-8 rounded ${page === currentPage ? 'bg-blue-600 text-white font-semibold' : 'bg-white border border-gray-200 text-gray-700 hover:bg-blue-50'}`}>{page}</button>
                ))}
                {totalPages > 4 && currentPage < totalPages - 2 && <span className="px-2">...</span>}
                {totalPages > 4 && <button onClick={() => setCurrentPage(totalPages)} className="w-8 h-8 rounded bg-white border border-gray-200 text-gray-700 hover:bg-blue-50">{totalPages}</button>}
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="w-8 h-8 rounded bg-white border border-gray-200 text-gray-700 hover:bg-blue-50 disabled:opacity-50">&gt;</button>
              </div>
            </div>
            {/* Appointment Details Modal */}
            {modalOpen && selectedAppointment && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative animate-fade-in">
                  <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold z-10" onClick={() => setModalOpen(false)}>&times;</button>
                  <h3 className="text-xl font-bold mb-4 text-blue-700">Appointment Information</h3>
                  <div className="space-y-2">
                    <div><span className="font-semibold">Date:</span> {selectedAppointment.date}</div>
                    <div><span className="font-semibold">Time:</span> {selectedAppointment.time}</div>
                    <div><span className="font-semibold">Doctor:</span> {selectedAppointment.doctor?.name || '-'}</div>
                    <div><span className="font-semibold">Treatment:</span> {selectedAppointment.treatment || selectedAppointment.service || '-'}</div>
                    <div><span className="font-semibold">Status:</span> {selectedAppointment.status}</div>
                    <div><span className="font-semibold">Duration:</span> {selectedAppointment.duration || '-'}</div>
                    <div><span className="font-semibold">Notes:</span> {selectedAppointment.notes || '-'}</div>
                  </div>
                </div>
              </div>
            )}
            {/* Filter Modal */}
            {showFilter && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative animate-fade-in">
                  <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold z-10" onClick={() => setShowFilter(false)}>&times;</button>
                  <h3 className="text-xl font-bold mb-4 text-blue-700">Filter Appointments</h3>
                  <div className="mb-4">
                    <label className="block font-semibold mb-1">Status</label>
                    <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} className="w-full border rounded px-3 py-2">
                      <option value="">All</option>
                      <option value="upcoming">Upcoming</option>
                      <option value="past">Past</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block font-semibold mb-1">Doctor</label>
                    <select value={selectedDoctor} onChange={e => setSelectedDoctor(e.target.value)} className="w-full border rounded px-3 py-2">
                      <option value="">All</option>
                      {doctorOptions.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => { setSelectedStatus(''); setSelectedDoctor(''); setShowFilter(false); }} className="px-4 py-2 rounded bg-gray-100 text-gray-700">Clear</button>
                    <button onClick={() => setShowFilter(false)} className="px-4 py-2 rounded bg-blue-600 text-white">Apply</button>
                  </div>
                </div>
              </div>
            )}
            {/* Add to Table Modal */}
            {showColumns && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative animate-fade-in">
                  <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold z-10" onClick={() => setShowColumns(false)}>&times;</button>
                  <h3 className="text-xl font-bold mb-4 text-blue-700">Add to Table</h3>
                  <div className="mb-6">
                    {Object.keys(visibleColumns).map(col => (
                      col !== 'actions' && <label key={col} className="flex items-center gap-2 mb-2">
                        <input type="checkbox" checked={visibleColumns[col]} onChange={e => setVisibleColumns(v => ({ ...v, [col]: e.target.checked }))} />
                        <span className="capitalize">{col}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setShowColumns(false)} className="px-4 py-2 rounded bg-blue-600 text-white">Save</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAppointments; 