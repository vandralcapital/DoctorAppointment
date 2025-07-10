import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from './Avatar';
import { getAvatarUrl } from '../utils/api';

const AvatarDropdown = ({ isDoctor, user, doctorInfo, logout }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const avatarRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    function handleClick(e) {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const avatarUrl = getAvatarUrl(isDoctor ? doctorInfo?.avatar : user?.avatar);
  const displayName = isDoctor ? doctorInfo?.name : user?.name;

  return (
    <div className="relative" ref={avatarRef}>
      <Avatar
        src={avatarUrl}
        name={displayName}
        size="md"
        className="cursor-pointer"
        onClick={() => setDropdownOpen((open) => !open)}
      />
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-100 animate-fade-in">
          <div className="px-4 py-2 text-gray-700 font-semibold border-b">{displayName}</div>
          <button
            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
            onClick={() => { setDropdownOpen(false); navigate(isDoctor ? '/doctor-dashboard' : '/dashboard'); }}
          >
            {isDoctor ? 'Doctor Dashboard' : 'Dashboard'}
          </button>
          <button
            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
            onClick={() => { setDropdownOpen(false); setSettingsOpen(true); }}
          >
            {isDoctor ? 'Doctor Settings' : 'Settings'}
          </button>
          <button
            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
            onClick={() => { setDropdownOpen(false); /* TODO: change photo */ }}
          >
            Change Photo
          </button>
          <button
            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default AvatarDropdown; 