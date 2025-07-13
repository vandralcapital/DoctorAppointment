import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS, apiRequest } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import './DoctorProfileEditor.css';

const DoctorProfileEditor = ({ onSave, onPreview, onCancel }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    qualification: '',
    avatar: '',
    phone: '',
    location: '',
    locationLink: '',
    bio: '',
    yearsOfExperience: 0,
    education: [''],
    certifications: [''],
    languages: [''],
    consultationFee: 0,
    consultationDuration: 30,
    specialties: [''],
    experience: [{
      position: '',
      hospital: '',
      duration: '',
      description: ''
    }],
    achievements: [''],
    publications: [''],
    socialLinks: {
      linkedin: '',
      twitter: '',
      website: ''
    }
  });

  useEffect(() => {
    loadDraftProfile();
  }, []);

  const loadDraftProfile = async () => {
    try {
      const response = await apiRequest(API_ENDPOINTS.DOCTOR_DRAFT_PROFILE(user.id), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.success) {
        setFormData(response.data.draftProfile);
      } else {
        setError('Failed to load draft profile');
      }
    } catch (err) {
      setError('Failed to load draft profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const handleArrayAdd = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], field === 'experience' ? {
        position: '',
        hospital: '',
        duration: '',
        description: ''
      } : '']
    }));
  };

  const handleArrayRemove = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleExperienceChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const handleSocialLinkChange = (platform, value) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiRequest(API_ENDPOINTS.DOCTOR_DRAFT_PROFILE(user.id), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.success) {
        setSuccess('Draft saved successfully!');
        if (onSave) onSave(response.data.draftProfile);
      } else {
        setError(response.error || 'Failed to save draft');
      }
    } catch (err) {
      setError('Failed to save draft');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    if (onPreview) onPreview(formData);
  };

  if (loading) {
    return (
      <div className="profile-editor-loading">
        <div className="loading-spinner"></div>
        <p>Loading draft profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-editor">
      <div className="profile-editor-header">
        <h2>Edit Profile</h2>
        <p>Update your professional profile information</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form className="profile-form" onSubmit={(e) => e.preventDefault()}>
        {/* Basic Information */}
        <div className="form-section">
          <h3>Basic Information</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Dr. John Doe"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Specialization *</label>
              <input
                type="text"
                value={formData.specialization}
                onChange={(e) => handleInputChange('specialization', e.target.value)}
                placeholder="Cardiology"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Qualification *</label>
              <input
                type="text"
                value={formData.qualification}
                onChange={(e) => handleInputChange('qualification', e.target.value)}
                placeholder="MBBS, MD"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Years of Experience</label>
              <input
                type="number"
                value={formData.yearsOfExperience}
                onChange={(e) => handleInputChange('yearsOfExperience', parseInt(e.target.value) || 0)}
                min="0"
                placeholder="5"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell patients about your expertise and approach..."
              rows="4"
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="form-section">
          <h3>Contact Information</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>
            
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Mumbai, Maharashtra"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Location Link (Google Maps)</label>
            <input
              type="url"
              value={formData.locationLink}
              onChange={(e) => handleInputChange('locationLink', e.target.value)}
              placeholder="https://maps.google.com/..."
            />
          </div>
        </div>

        {/* Consultation Details */}
        <div className="form-section">
          <h3>Consultation Details</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Consultation Fee (₹)</label>
              <input
                type="number"
                value={formData.consultationFee}
                onChange={(e) => handleInputChange('consultationFee', parseInt(e.target.value) || 0)}
                min="0"
                placeholder="500"
              />
            </div>
            
            <div className="form-group">
              <label>Consultation Duration (minutes)</label>
              <input
                type="number"
                value={formData.consultationDuration}
                onChange={(e) => handleInputChange('consultationDuration', parseInt(e.target.value) || 30)}
                min="15"
                max="120"
                placeholder="30"
              />
            </div>
          </div>
        </div>

        {/* Education */}
        <div className="form-section">
          <h3>Education</h3>
          {formData.education.map((edu, index) => (
            <div key={index} className="form-row">
              <div className="form-group">
                <input
                  type="text"
                  value={edu}
                  onChange={(e) => handleArrayChange('education', index, e.target.value)}
                  placeholder="MBBS from AIIMS Delhi"
                />
              </div>
              <button
                type="button"
                onClick={() => handleArrayRemove('education', index)}
                className="remove-btn"
                disabled={formData.education.length === 1}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleArrayAdd('education')}
            className="add-btn"
          >
            + Add Education
          </button>
        </div>

        {/* Certifications */}
        <div className="form-section">
          <h3>Certifications</h3>
          {formData.certifications.map((cert, index) => (
            <div key={index} className="form-row">
              <div className="form-group">
                <input
                  type="text"
                  value={cert}
                  onChange={(e) => handleArrayChange('certifications', index, e.target.value)}
                  placeholder="Fellowship in Cardiology"
                />
              </div>
              <button
                type="button"
                onClick={() => handleArrayRemove('certifications', index)}
                className="remove-btn"
                disabled={formData.certifications.length === 1}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleArrayAdd('certifications')}
            className="add-btn"
          >
            + Add Certification
          </button>
        </div>

        {/* Languages */}
        <div className="form-section">
          <h3>Languages Spoken</h3>
          {formData.languages.map((lang, index) => (
            <div key={index} className="form-row">
              <div className="form-group">
                <input
                  type="text"
                  value={lang}
                  onChange={(e) => handleArrayChange('languages', index, e.target.value)}
                  placeholder="English, Hindi, Marathi"
                />
              </div>
              <button
                type="button"
                onClick={() => handleArrayRemove('languages', index)}
                className="remove-btn"
                disabled={formData.languages.length === 1}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleArrayAdd('languages')}
            className="add-btn"
          >
            + Add Language
          </button>
        </div>

        {/* Specialties */}
        <div className="form-section">
          <h3>Specialties</h3>
          {formData.specialties.map((specialty, index) => (
            <div key={index} className="form-row">
              <div className="form-group">
                <input
                  type="text"
                  value={specialty}
                  onChange={(e) => handleArrayChange('specialties', index, e.target.value)}
                  placeholder="Interventional Cardiology"
                />
              </div>
              <button
                type="button"
                onClick={() => handleArrayRemove('specialties', index)}
                className="remove-btn"
                disabled={formData.specialties.length === 1}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleArrayAdd('specialties')}
            className="add-btn"
          >
            + Add Specialty
          </button>
        </div>

        {/* Experience */}
        <div className="form-section">
          <h3>Professional Experience</h3>
          {formData.experience.map((exp, index) => (
            <div key={index} className="experience-item">
              <div className="form-row">
                <div className="form-group">
                  <label>Position</label>
                  <input
                    type="text"
                    value={exp.position}
                    onChange={(e) => handleExperienceChange(index, 'position', e.target.value)}
                    placeholder="Senior Cardiologist"
                  />
                </div>
                <div className="form-group">
                  <label>Hospital/Institution</label>
                  <input
                    type="text"
                    value={exp.hospital}
                    onChange={(e) => handleExperienceChange(index, 'hospital', e.target.value)}
                    placeholder="Apollo Hospital"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Duration</label>
                  <input
                    type="text"
                    value={exp.duration}
                    onChange={(e) => handleExperienceChange(index, 'duration', e.target.value)}
                    placeholder="2018 - Present"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleArrayRemove('experience', index)}
                  className="remove-btn"
                  disabled={formData.experience.length === 1}
                >
                  Remove
                </button>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={exp.description}
                  onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                  placeholder="Describe your role and achievements..."
                  rows="3"
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleArrayAdd('experience')}
            className="add-btn"
          >
            + Add Experience
          </button>
        </div>

        {/* Achievements */}
        <div className="form-section">
          <h3>Achievements & Awards</h3>
          {formData.achievements.map((achievement, index) => (
            <div key={index} className="form-row">
              <div className="form-group">
                <input
                  type="text"
                  value={achievement}
                  onChange={(e) => handleArrayChange('achievements', index, e.target.value)}
                  placeholder="Best Cardiologist Award 2023"
                />
              </div>
              <button
                type="button"
                onClick={() => handleArrayRemove('achievements', index)}
                className="remove-btn"
                disabled={formData.achievements.length === 1}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleArrayAdd('achievements')}
            className="add-btn"
          >
            + Add Achievement
          </button>
        </div>

        {/* Publications */}
        <div className="form-section">
          <h3>Publications</h3>
          {formData.publications.map((pub, index) => (
            <div key={index} className="form-row">
              <div className="form-group">
                <input
                  type="text"
                  value={pub}
                  onChange={(e) => handleArrayChange('publications', index, e.target.value)}
                  placeholder="Research paper title or publication"
                />
              </div>
              <button
                type="button"
                onClick={() => handleArrayRemove('publications', index)}
                className="remove-btn"
                disabled={formData.publications.length === 1}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleArrayAdd('publications')}
            className="add-btn"
          >
            + Add Publication
          </button>
        </div>

        {/* Social Links */}
        <div className="form-section">
          <h3>Social Links</h3>
          <div className="form-row">
            <div className="form-group">
              <label>LinkedIn</label>
              <input
                type="url"
                value={formData.socialLinks.linkedin}
                onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                placeholder="https://linkedin.com/in/..."
              />
            </div>
            <div className="form-group">
              <label>Twitter</label>
              <input
                type="url"
                value={formData.socialLinks.twitter}
                onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                placeholder="https://twitter.com/..."
              />
            </div>
          </div>
          <div className="form-group">
            <label>Website</label>
            <input
              type="url"
              value={formData.socialLinks.website}
              onChange={(e) => handleSocialLinkChange('website', e.target.value)}
              placeholder="https://yourwebsite.com"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="form-actions">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary"
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          
          <button
            type="button"
            onClick={handlePreview}
            className="btn btn-secondary"
          >
            Preview
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-outline"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default DoctorProfileEditor; 