import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import Avatar from './Avatar';
import { getAvatarUrl, API_ENDPOINTS } from '../utils/api';

function LandingPage() {
  console.log('LandingPage rendered');
  const { isAuthenticated, user, logout } = useAuth();
  const [allDoctors, setAllDoctors] = useState([]);
  const [loadingAllDoctors, setLoadingAllDoctors] = useState(true);

  useEffect(() => {
    console.log('Fetching doctors...');
    async function fetchAllDoctors() {
      setLoadingAllDoctors(true);
      try {
        const res = await fetch(API_ENDPOINTS.DOCTORS);
        const data = await res.json();
        console.log('Fetched doctors:', data.doctors);
        setAllDoctors(data.doctors || []);
      } catch (err) {
        console.log('Fetch error:', err);
        setAllDoctors([]);
      }
      setLoadingAllDoctors(false);
    }
    fetchAllDoctors();
  }, []);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center bg-blue-700 text-white px-8 py-16 relative overflow-hidden min-h-[400px]">
        <div className="max-w-2xl w-full text-center md:text-left md:mx-auto md:ml-32">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Search Your Doctor Appointment Online.</h1>
          <p className="mb-6 text-lg">A Healthier Tomorrow Starts Today. Schedule Your Appointment!<br />Your Wellness, Our Expertise: Set Up Your Appointment Today.</p>
          <div className="flex flex-col md:flex-row md:justify-start justify-center items-center space-y-3 md:space-y-0 md:space-x-4">
            {isAuthenticated ? (
              <Link 
                to="/dashboard"
                className="bg-white text-blue-700 px-5 py-2 rounded-lg font-semibold shadow hover:bg-gray-100 transition"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link 
                to="/signup"
                className="bg-white text-blue-700 px-5 py-2 rounded-lg font-semibold shadow hover:bg-gray-100 transition"
              >
                Book An Appointment
              </Link>
            )}
            <button className="border border-white px-5 py-2 rounded-lg font-semibold flex items-center space-x-2 hover:bg-white hover:text-blue-700 transition">
              <i className='bx bx-phone-ring'></i>
              <span>Call now</span>
            </button>
          </div>
        </div>
        {/* Decorative background shape */}
        <div className="absolute right-0 bottom-0 w-2/3 h-96 bg-white bg-opacity-5 rounded-l-full z-0"></div>
      </section>

      {/* Search Bar */}
      <div className="flex justify-center -mt-8 z-20 relative">
        <div className="bg-white rounded-xl shadow-lg flex flex-col md:flex-row items-center px-4 py-4 w-full max-w-3xl">
          <select className="border border-gray-300 rounded-lg px-4 py-2 mb-2 md:mb-0 md:mr-4 focus:outline-none">
            <option>Select Date & Time</option>
            <option>Today, 10:00 AM</option>
            <option>Tomorrow, 2:00 PM</option>
          </select>
          <input type="text" placeholder="Search doctors, name, specialist" className="flex-1 border border-gray-300 rounded-lg px-4 py-2 mb-2 md:mb-0 md:mr-4 focus:outline-none" />
          <button className="bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-blue-800 transition flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" /></svg>
            Search
          </button>
        </div>
      </div>

      {/* All Listed Doctors Section */}
      <section className="py-12 px-4 bg-blue-50 flex flex-col items-center">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-blue-900">All Listed Doctors</h2>
        <p className="text-lg text-blue-700 max-w-2xl text-center mb-8">Browse all doctors available on our platform.</p>
        {loadingAllDoctors ? (
          <div className="text-blue-500">Loading...</div>
        ) : allDoctors.length === 0 ? (
          <div className="text-blue-400">No doctors found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 w-full max-w-6xl">
            {allDoctors.map((doc, idx) => (
              <DoctorCard key={doc._id || idx} doctor={doc} />
            ))}
          </div>
        )}
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-2 bg-gradient-to-b from-white to-blue-50 flex flex-col items-center">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-gray-900">How It Works!</h2>
        <p className="text-lg text-gray-600 max-w-2xl text-center mb-10">
          Discover, book, and experience personalized healthcare effortlessly with our user-friendly Doctor Appointment Website.
        </p>
        <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl justify-center items-center">
          {/* Step 1 */}
          <div className="bg-white rounded-2xl shadow-lg flex flex-col items-center p-8 w-[90%] max-w-xs md:w-1/3 mx-auto mb-6 md:mb-0 border border-blue-100 transition hover:shadow-2xl">
            <i className='bx bx-search-plus text-blue-700 text-5xl mb-6 mt-2'></i>
            <h3 className="font-bold text-xl mb-2 text-gray-800">Search Doctor</h3>
            <p className="text-gray-600 text-center">Find the right doctor for your needs by specialty, name, or location in seconds.</p>
          </div>
          {/* Step 2 */}
          <div className="bg-white rounded-2xl shadow-lg flex flex-col items-center p-8 w-[90%] max-w-xs md:w-1/3 mx-auto mb-6 md:mb-0 border border-blue-100 transition hover:shadow-2xl">
            <i className='bx bx-calendar-check text-blue-700 text-5xl mb-6 mt-2'></i>
            <h3 className="font-bold text-xl mb-2 text-gray-800">Book Appointment</h3>
            <p className="text-gray-600 text-center">Choose your preferred date and time, then book your appointment instantly online.</p>
          </div>
          {/* Step 3 */}
          <div className="bg-white rounded-2xl shadow-lg flex flex-col items-center p-8 w-[90%] max-w-xs md:w-1/3 mx-auto border border-blue-100 transition hover:shadow-2xl">
            <i className='bx bx-message-dots text-blue-700 text-5xl mb-6 mt-2'></i>
            <h3 className="font-bold text-xl mb-2 text-gray-800">Get Consultation</h3>
            <p className="text-gray-600 text-center">Visit the doctor at your scheduled time and get expert medical advice and care.</p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-white flex flex-col items-center">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-gray-900">Frequently Asked Questions</h2>
        <p className="text-lg text-gray-600 max-w-2xl text-center mb-10">
          Find answers to the most common questions about booking doctor appointments online.
        </p>
        <div className="w-full max-w-2xl space-y-4">
          <FAQItem question="How do I book an appointment?" answer="Simply search for your preferred doctor, select a date and time, and click 'Book Appointment'. You'll receive a confirmation instantly." />
          <FAQItem question="Can I reschedule or cancel my appointment?" answer="Yes, you can easily reschedule or cancel your appointment from your account dashboard or by contacting our support team." />
          <FAQItem question="Is my personal information safe?" answer="Absolutely. We use advanced security measures to protect your data and ensure your privacy at all times." />
          <FAQItem question="Do I need to create an account?" answer="While you can browse doctors without an account, booking an appointment requires a quick and easy sign-up for your convenience and security." />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-700 text-white py-8 px-4 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
          <div className="mb-6 md:mb-0 flex flex-col items-center md:items-start">
            <span className="text-2xl font-bold mb-2">Parchi</span>
            <span className="text-sm text-blue-100">Your trusted healthcare partner</span>
          </div>
          <div className="flex flex-col md:flex-row gap-6 text-center md:text-left">
            <a href="#" className="hover:underline">Home</a>
            <a href="#" className="hover:underline">Find a Doctor</a>
            <a href="#" className="hover:underline">Services</a>
            <a href="#" className="hover:underline">About Us</a>
            <a href="#" className="hover:underline">Contact</a>
          </div>
        </div>
        <div className="text-center mt-6">
          <span className="text-white text-sm">New Doctor? </span>
          <a href="/doctor-signup" className="text-blue-200 underline hover:text-white font-semibold">Sign Up here</a>
          <span className="text-white text-sm mx-2">|</span>
          <a href="/doctor-login" className="text-blue-200 underline hover:text-white font-semibold">Doctor Login</a>
        </div>
        <div className="text-center text-blue-100 text-xs mt-8">&copy; {new Date().getFullYear()} Parchi. All rights reserved.</div>
      </footer>
    </div>
  );
}

// FAQ Accordion Item Component
function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        className="w-full flex justify-between items-center px-6 py-4 bg-gray-50 hover:bg-gray-100 focus:outline-none"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="font-semibold text-gray-800 text-left">{question}</span>
        <i className={`bx text-2xl ml-2 transition-transform ${open ? 'bx-chevron-up' : 'bx-chevron-down'}`}></i>
      </button>
      {open && (
        <div className="px-6 py-4 bg-white text-gray-700 border-t border-gray-200 animate-fade-in">
          {answer}
        </div>
      )}
    </div>
  );
}



function DoctorCard({ doctor }) {
  const navigate = useNavigate();
  function handleBookNow() {
    const bookingId = `${doctor?._id || ''}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    navigate(`/book/${doctor?._id || ''}/${bookingId}`, {
      state: {
        name: doctor?.name || '-',
        specialization: doctor?.specialization || '-'
      }
    });
  }
  // Avatar URL logic
  const avatarUrl = getAvatarUrl(doctor?.avatar);
  return (
    <div className="bg-white border border-blue-100 rounded-2xl shadow-lg p-6 flex flex-col items-center transition hover:shadow-2xl hover:-translate-y-1 duration-200">
      <Avatar
        src={avatarUrl}
        name={doctor?.name || '-'}
        size="2xl"
        className="mb-4 border-4 border-blue-200 shadow"
        fallbackColor="blue"
      />
      <div className="font-bold text-lg text-gray-900 mb-1 text-center">{doctor?.name || '-'}</div>
      <div className="text-blue-700 text-sm font-medium mb-1 text-center">
        Specialization: {doctor?.specialization && doctor?.specialization !== 'none' ? doctor?.specialization : 'None'}
      </div>
      {doctor?.email && <div className="text-xs text-gray-500 mb-1 text-center">{doctor?.email}</div>}
      {doctor?.createdAt && <div className="text-xs text-gray-400">Joined: {new Date(doctor?.createdAt).toLocaleDateString()}</div>}
      <button onClick={handleBookNow} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition">Book Now</button>
    </div>
  );
}

export default LandingPage; 