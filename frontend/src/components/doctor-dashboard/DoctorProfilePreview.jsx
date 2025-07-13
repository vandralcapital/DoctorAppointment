import React from 'react';
import { getAvatarUrl } from '../../utils/api';
import './DoctorProfilePreview.css';

const DoctorProfilePreview = ({ profile, onEdit, onPublish, onBack }) => {
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
      <div className="preview-section">
        <h3>{title}</h3>
        <ul className="preview-list">
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
      <div className="preview-section">
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
      <div className="preview-section">
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

  return (
    <div className="profile-preview">
      <div className="preview-header">
        <h2>Profile Preview</h2>
        <p>This is how your profile will appear to patients</p>
      </div>

      <div className="preview-content">
        {/* Header Section */}
        <div className="preview-header-section">
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
            <h1 className="doctor-name">{profile.name || 'Dr. [Your Name]'}</h1>
            <p className="doctor-specialization">{profile.specialization || 'Specialization'}</p>
            <p className="doctor-qualification">{profile.qualification || 'Qualification'}</p>
            
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
        </div>

        {/* Consultation Details */}
        {(profile.consultationFee > 0 || profile.consultationDuration) && (
          <div className="preview-section consultation-details">
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
          <div className="preview-section">
            <h3>About</h3>
            <p className="doctor-bio">{profile.bio}</p>
          </div>
        )}

        {/* Contact Information */}
        {(profile.phone || profile.locationLink) && (
          <div className="preview-section">
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

      {/* Action Buttons */}
      <div className="preview-actions">
        <button onClick={onEdit} className="btn btn-secondary">
          <i className="fas fa-edit"></i>
          Edit Profile
        </button>
        
        <button onClick={onPublish} className="btn btn-primary">
          <i className="fas fa-globe"></i>
          Publish Profile
        </button>
        
        {onBack && (
          <button onClick={onBack} className="btn btn-outline">
            <i className="fas fa-arrow-left"></i>
            Back
          </button>
        )}
      </div>

      {/* Preview Notice */}
      <div className="preview-notice">
        <i className="fas fa-eye"></i>
        <p>This is a preview of your profile. Changes are not yet published and visible to patients.</p>
      </div>
    </div>
  );
};

export default DoctorProfilePreview; 