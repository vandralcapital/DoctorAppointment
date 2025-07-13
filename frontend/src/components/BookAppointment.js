import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import { getAvatarUrl, API_ENDPOINTS } from '../utils/api';
import Navbar from './Navbar';

// Generate available slots for the next 7 days
const generateAvailableDates = () => {
  const dates = [];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    dates.push({
      date: date.toISOString().split('T')[0],
      day: days[date.getDay()]
    });
  }
  return dates;
};

const availableDates = generateAvailableDates();
const availableTimes = ['08:30', '09:30', '10:30', '11:30', '12:30', '13:30', '14:30', '15:30', '16:30', '17:30', '18:30'];

function isGoogleMapsUrl(url) {
  return typeof url === 'string' && url.startsWith('https://www.google.com/maps');
}

function isGoogleMapsEmbedUrl(url) {
  return typeof url === 'string' && url.startsWith('https://www.google.com/maps/embed');
}

function parseLocation(locationStr) {
  if (!locationStr) return { address: '', mapUrl: '' };
  // Regex to find a Google Maps link
  const urlRegex = /(https?:\/\/(www\.)?(google\.com\/maps|maps\.app\.goo\.gl)[^\s]*)/i;
  const match = locationStr.match(urlRegex);
  if (match) {
    return {
      address: locationStr.replace(match[0], '').trim(),
      mapUrl: match[0]
    };
  }
  return { address: locationStr, mapUrl: '' };
}

function getGoogleMapsEmbedUrl(url) {
  if (!url) return '';
  if (url.startsWith('https://www.google.com/maps/embed')) return url;
  // Convert /maps/place/... or /maps?q=... to embed
  if (url.startsWith('https://www.google.com/maps/place/')) {
    return url.replace('/maps/place/', '/maps/embed?pb=!1s')
      .replace(/\?.*$/, ''); // Remove query params
  }
  if (url.startsWith('https://www.google.com/maps/')) {
    // /maps?q=... or /maps/dir/... etc
    const qMatch = url.match(/[?&]q=([^&]+)/);
    if (qMatch) {
      return `https://www.google.com/maps/embed?q=${qMatch[1]}`;
    }
  }
  // For maps.app.goo.gl short links, cannot reliably convert, so just return empty
  return '';
}

function BookAppointment() {
  const { doctorId, bookingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, token } = useAuth();
  const [selectedDate, setSelectedDate] = useState(availableDates[1].date); // default to 2nd date
  const [selectedTime, setSelectedTime] = useState('09:30');
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [appointmentData, setAppointmentData] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDoctor() {
      setLoading(true);
      try {
        const res = await fetch(`/api/doctors/${doctorId}`);
        const data = await res.json();
        let name = data.doctor?.name || location.state?.name || '-';
        let specialization = data.doctor?.specialization || location.state?.specialization || '-';
        setDoctor({
          name,
          specialization,
          avatar: data.doctor?.avatar || '',
          bio: data.doctor?.bio || '-',
          location: data.doctor?.location || '-',
          locationLink: data.doctor?.locationLink || '',
        });
      } catch (e) {
        setDoctor({
          name: location.state?.name || '-',
          specialization: location.state?.specialization || '-',
          avatar: '',
          bio: '-',
          location: '-',
          locationLink: '',
        });
      }
      setLoading(false);
    }
    fetchDoctor();
  }, [doctorId, location.state]);

  async function handleConfirm() {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setConfirming(true);
    try {
      const response = await fetch(API_ENDPOINTS.BOOK_APPOINTMENT(doctorId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          patientName: user?.name || 'Anonymous',
          date: selectedDate,
          time: selectedTime,
          treatment: 'General Consultation'
        })
      });
      
      const data = await response.json();
      if (response.ok) {
        setAppointmentData(data);
        setConfirmed(true);
      } else {
        alert(data.message || 'Failed to book appointment');
      }
    } catch (e) {
      alert('Failed to book appointment');
    } finally {
      setConfirming(false);
    }
  }

  if (loading || !doctor) {
    return <div className="min-h-screen flex items-center justify-center text-blue-700 text-xl font-bold">Loading doctor info...</div>;
  }

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col md:flex-row items-start justify-center p-6 gap-8">
        {/* Main Booking Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-2xl mb-8 md:mb-0">
          <h2 className="text-2xl font-bold mb-6 text-blue-700">Make Appointment</h2>
          {/* Doctor Info (small) */}
          <div className="flex items-center gap-4 mb-8">
            <Avatar
              src={getAvatarUrl(doctor?.avatar)}
              name={doctor?.name || '-'}
              size="xl"
              className="border-2 border-blue-200"
              fallbackColor="blue"
            />
            <div>
              <div className="font-bold text-lg text-gray-900">{doctor?.name || '-'}</div>
              <div className="text-blue-700 text-sm font-medium">{doctor?.specialization || '-'}</div>
            </div>
          </div>
          {/* Date Picker */}
          <div className="mb-6">
            <div className="font-semibold text-gray-700 mb-2">Choose date</div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {availableDates
                .filter((d) => {
                  const today = new Date();
                  today.setHours(0,0,0,0);
                  const dateObj = new Date(d.date);
                  return dateObj >= today;
                })
                .map((d) => (
                  <button
                    key={d.date}
                    onClick={() => setSelectedDate(d.date)}
                    className={`flex flex-col items-center px-4 py-2 rounded-lg border transition font-semibold min-w-[60px] ${selectedDate === d.date ? 'bg-blue-600 text-white border-blue-700' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-blue-100'}`}
                  >
                    <span className="text-xs">{d.day}</span>
                    <span className="text-lg">{d.date.slice(-2)}</span>
                  </button>
                ))}
            </div>
          </div>
          {/* Time Picker */}
          <div className="mb-8">
            <div className="font-semibold text-gray-700 mb-2">Choose time</div>
            <div className="flex flex-wrap gap-2">
              {availableTimes.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTime(t)}
                  className={`px-4 py-2 rounded-lg border font-semibold transition min-w-[80px] ${selectedTime === t ? 'bg-blue-600 text-white border-blue-700' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-blue-100'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          {/* Confirm Button */}
          <button
            onClick={handleConfirm}
            disabled={confirming || confirmed || !isAuthenticated}
            className={`w-full py-3 rounded-lg font-bold text-lg transition ${confirmed ? 'bg-green-500 text-white' : 'bg-blue-700 text-white hover:bg-blue-800'} ${(confirming || !isAuthenticated) ? 'opacity-60' : ''}`}
          >
            {confirmed
              ? 'Appointment Confirmed!'
              : confirming
                ? 'Confirming...'
                : !isAuthenticated
                  ? 'Login to Book Appointment'
                  : 'Confirm Appointment'}
          </button>
          {!isAuthenticated && (
            <div className="mt-2 text-red-600 text-center font-semibold">
              Please log in to book an appointment.
            </div>
          )}
          {confirmed && appointmentData && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-green-600 text-center font-semibold mb-2">
                Your appointment is booked for {selectedDate} at {selectedTime}.
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2">Your OTP for verification:</div>
                <div className="text-2xl font-bold text-blue-700 bg-blue-100 px-4 py-2 rounded-lg inline-block">
                  {appointmentData.otp}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Show this OTP to your doctor when you arrive for verification.
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Doctor Details Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm flex flex-col items-center">
          <Avatar
            src={getAvatarUrl(doctor?.avatar)}
            name={doctor?.name || '-'}
            size="3xl"
            className="border-4 border-blue-200 mb-4"
            fallbackColor="blue"
          />
          <div className="font-bold text-xl text-gray-900 mb-1">{doctor?.name || '-'}</div>
          <div className="text-blue-700 text-sm font-medium mb-2">{doctor?.specialization || '-'}</div>
          <div className="flex gap-2 mb-4">
            <button className="bg-blue-100 text-blue-700 rounded-full p-2"><span role="img" aria-label="chat">💬</span></button>
            <button className="bg-blue-100 text-blue-700 rounded-full p-2"><span role="img" aria-label="call">📞</span></button>
            <button className="bg-blue-100 text-blue-700 rounded-full p-2"><span role="img" aria-label="video">🎥</span></button>
          </div>
          <div className="text-gray-700 text-sm mb-4 text-center">{doctor?.bio || '-'}</div>
          <div className="text-gray-500 text-xs mb-2">Location</div>
          {(() => {
            const address = doctor?.location;
            const mapUrl = doctor?.locationLink;
            const embedUrl = getGoogleMapsEmbedUrl(mapUrl);
            return (
              <>
                {address && <div className="text-gray-800 text-sm font-medium mb-1">{address}</div>}
                {mapUrl && (
                  <>
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline text-sm mb-1 inline-block"
                    >
                      View on Map
                    </a>
                    {embedUrl && (
                      <div className="w-full h-32 bg-blue-100 rounded-lg flex items-center justify-center text-blue-400 mt-2">
                        <iframe
                          title="Google Map"
                          src={embedUrl}
                          width="100%"
                          height="120"
                          style={{ border: 0, borderRadius: '0.5rem' }}
                          allowFullScreen=""
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                      </div>
                    )}
                  </>
                )}
                {!address && !mapUrl && <div className="text-gray-800 text-sm font-medium mb-2">Not specified</div>}
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

export default BookAppointment; 