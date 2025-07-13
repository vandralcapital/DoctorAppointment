import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API_ENDPOINTS, apiRequest, getAvatarUrl } from '../../utils/api';
import './DoctorPublicProfile.css';

const DoctorPublicProfile = () => {
  const { doctorId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPublicProfile();
  }, [doctorId]);

  const loadPublicProfile = async () => {
    try {
      const response = await apiRequest(API_ENDPOINTS.DOCTOR_PUBLIC_PROFILE(doctorId));

      if (response.success) {
        setProfile(response.data.publicProfile);
      } else {
        setError(response.error || 'Profile not found');
      }
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const renderArrayItems = (items, title) => {
    if (!items || items.length === 0 || (items.length === 1 && !items[0])) {
      return null;
    }
    
    return (
      <div className="public-section">
        <h3>{title}</h3>
        <ul className="public-list">
          {items.filter(item => item).map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
    );
  };

  const renderExperience = (experience) => {
    if (!experience || experience.length === 0 || 
        (experience.length === 1 && !experience[0].position && !experience[0].hospital)) {
      return null;
    }

    return (
      <div className="public-section">
        <h3>Professional Experience</h3>
        <div className="experience-list">
          {experience.filter(exp => exp.position || exp.hospital).map((exp, index) => (
            <div key={index} className="experience-item">
              <div className="experience-header">
                <h4>{exp.position}</h4>
                <span className="experience-duration">{exp.duration}</span>
              </div>
              <div className="experience-hospital">{exp.hospital}</div>
              {exp.description && (
                <div className="experience-description">{exp.description}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSocialLinks = (socialLinks) => {
    if (!socialLinks || (!socialLinks.linkedin && !socialLinks.twitter && !socialLinks.website)) {
      return null;
    }

    return (
      <div className="public-section">
        <h3>Connect</h3>
        <div className="social-links">
          {socialLinks.linkedin && (
            <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="social-link linkedin">
              <i className="fab fa-linkedin"></i>
              LinkedIn
            </a>
          )}
          {socialLinks.twitter && (
            <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="social-link twitter">
              <i className="fab fa-twitter"></i>
              Twitter
            </a>
          )}
          {socialLinks.website && (
            <a href={socialLinks.website} target="_blank" rel="noopener noreferrer" className="social-link website">
              <i className="fas fa-globe"></i>
              Website
            </a>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="public-profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading doctor profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="public-profile-error">
        <div className="error-content">
          <i className="fas fa-exclamation-triangle"></i>
          <h2>Profile Not Available</h2>
          <p>{error}</p>
          <Link to="/" className="btn btn-primary">
            <i className="fas fa-home"></i>
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="public-profile-error">
        <div className="error-content">
          <i className="fas fa-user-md"></i>
          <h2>Profile Not Published</h2>
          <p>This doctor's profile has not been published yet.</p>
          <Link to="/" className="btn btn-primary">
            <i className="fas fa-home"></i>
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="public-profile">
      {/* Header Section */}
      <div className="public-header-section">
        <div className="doctor-avatar">
          {profile.avatar ? (
            <img src={getAvatarUrl(profile.avatar, true)} alt={profile.name} />
          ) : (
            <div className="avatar-placeholder">
              <i className="fas fa-user-md"></i>
            </div>
          )}
        </div>
        
        <div className="doctor-info">
          <h1 className="doctor-name">{profile.name}</h1>
          <p className="doctor-specialization">{profile.specialization}</p>
          <p className="doctor-qualification">{profile.qualification}</p>
          
          {profile.yearsOfExperience > 0 && (
            <p className="doctor-experience">
              <i className="fas fa-clock"></i>
              {profile.yearsOfExperience} years of experience
            </p>
          )}
          
          {profile.location && (
            <p className="doctor-location">
              <i className="fas fa-map-marker-alt"></i>
              {profile.location}
            </p>
          )}
        </div>

        <div className="booking-section">
          <div className="consultation-summary">
            {profile.consultationFee > 0 && (
              <div className="fee-info">
                <span className="fee-label">Consultation Fee</span>
                <span className="fee-amount">{formatCurrency(profile.consultationFee)}</span>
              </div>
            )}
            {profile.consultationDuration && (
              <div className="duration-info">
                <span className="duration-label">Duration</span>
                <span className="duration-value">{formatDuration(profile.consultationDuration)}</span>
              </div>
            )}
          </div>
          
          <Link 
            to={`/book-appointment/${doctorId}`} 
            className="btn btn-primary book-btn"
          >
            <i className="fas fa-calendar-plus"></i>
            Book Appointment
          </Link>
        </div>
      </div>

      <div className="public-content">
        {/* Consultation Details */}
        {(profile.consultationFee > 0 || profile.consultationDuration) && (
          <div className="public-section consultation-details">
            <h3>Consultation Details</h3>
            <div className="consultation-info">
              {profile.consultationFee > 0 && (
                <div className="consultation-item">
                  <span className="label">Fee:</span>
                  <span className="value">{formatCurrency(profile.consultationFee)}</span>
                </div>
              )}
              {profile.consultationDuration && (
                <div className="consultation-item">
                  <span className="label">Duration:</span>
                  <span className="value">{formatDuration(profile.consultationDuration)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bio */}
        {profile.bio && (
          <div className="public-section">
            <h3>About</h3>
            <p className="doctor-bio">{profile.bio}</p>
          </div>
        )}

        {/* Contact Information */}
        {(profile.phone || profile.locationLink) && (
          <div className="public-section">
            <h3>Contact Information</h3>
            <div className="contact-info">
              {profile.phone && (
                <div className="contact-item">
                  <i className="fas fa-phone"></i>
                  <span>{profile.phone}</span>
                </div>
              )}
              {profile.locationLink && (
                <div className="contact-item">
                  <i className="fas fa-map-marker-alt"></i>
                  <a href={profile.locationLink} target="_blank" rel="noopener noreferrer">
                    View on Map
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Education */}
        {renderArrayItems(profile.education, 'Education')}

        {/* Certifications */}
        {renderArrayItems(profile.certifications, 'Certifications')}

        {/* Languages */}
        {renderArrayItems(profile.languages, 'Languages Spoken')}

        {/* Specialties */}
        {renderArrayItems(profile.specialties, 'Specialties')}

        {/* Experience */}
        {renderExperience(profile.experience)}

        {/* Achievements */}
        {renderArrayItems(profile.achievements, 'Achievements & Awards')}

        {/* Publications */}
        {renderArrayItems(profile.publications, 'Publications')}

        {/* Social Links */}
        {renderSocialLinks(profile.socialLinks)}
      </div>

      {/* Bottom Booking Section */}
      <div className="bottom-booking">
        <div className="booking-info">
          <h3>Ready to Book an Appointment?</h3>
          <p>Schedule your consultation with {profile.name}</p>
        </div>
        <Link 
          to={`/book-appointment/${doctorId}`} 
          className="btn btn-primary book-btn-large"
        >
          <i className="fas fa-calendar-plus"></i>
          Book Appointment Now
        </Link>
      </div>
    </div>
  );
};

export default DoctorPublicProfile; 