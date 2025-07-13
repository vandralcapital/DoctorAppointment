import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS, apiRequest } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import DoctorProfileEditor from './DoctorProfileEditor';
import DoctorProfilePreview from './DoctorProfilePreview';
import './ProfileManagement.css';

const ProfileManagement = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState('status'); // status, editor, preview
  const [profileStatus, setProfileStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadProfileStatus();
  }, []);

  const loadProfileStatus = async () => {
    try {
      const response = await apiRequest(API_ENDPOINTS.DOCTOR_PROFILE_STATUS(user.id), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.success) {
        setProfileStatus(response.data);
      } else {
        setError('Failed to load profile status');
      }
    } catch (err) {
      setError('Failed to load profile status');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiRequest(API_ENDPOINTS.DOCTOR_PUBLISH_PROFILE(user.id), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.success) {
        setSuccess('Profile published successfully!');
        await loadProfileStatus();
        setCurrentView('status');
      } else {
        setError(response.error || 'Failed to publish profile');
      }
    } catch (err) {
      setError('Failed to publish profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = (draftData) => {
    setSuccess('Draft saved successfully!');
    // Optionally reload status
    loadProfileStatus();
  };

  const handlePreview = (draftData) => {
    setCurrentView('preview');
  };

  const handleBackToStatus = () => {
    setCurrentView('status');
    setError('');
    setSuccess('');
  };

  const handleEditProfile = () => {
    setCurrentView('editor');
    setError('');
    setSuccess('');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && currentView === 'status') {
    return (
      <div className="profile-management-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile status...</p>
      </div>
    );
  }

  if (currentView === 'editor') {
    return (
      <div className="profile-management">
        <DoctorProfileEditor
          onSave={handleSaveDraft}
          onPreview={handlePreview}
          onCancel={handleBackToStatus}
        />
      </div>
    );
  }

  if (currentView === 'preview') {
    return (
      <div className="profile-management">
        <DoctorProfilePreview
          onEdit={handleEditProfile}
          onPublish={handlePublish}
          onBack={handleBackToStatus}
        />
      </div>
    );
  }

  return (
    <div className="profile-management">
      <div className="profile-status">
        <div className="status-header">
          <h2>Profile Management</h2>
          <p>Manage your professional profile visibility</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="status-cards">
          {/* Publication Status */}
          <div className={`status-card ${profileStatus?.isPublished ? 'published' : 'unpublished'}`}>
            <div className="status-icon">
              {profileStatus?.isPublished ? (
                <i className="fas fa-globe"></i>
              ) : (
                <i className="fas fa-eye-slash"></i>
              )}
            </div>
            <div className="status-content">
              <h3>Publication Status</h3>
              <p className="status-text">
                {profileStatus?.isPublished ? 'Published' : 'Not Published'}
              </p>
              <p className="status-description">
                {profileStatus?.isPublished 
                  ? 'Your profile is visible to patients'
                  : 'Your profile is not visible to patients yet'
                }
              </p>
              {profileStatus?.lastPublished && (
                <p className="status-date">
                  Last published: {formatDate(profileStatus.lastPublished)}
                </p>
              )}
            </div>
          </div>

          {/* Draft Status */}
          <div className={`status-card ${profileStatus?.hasDraft ? 'has-draft' : 'no-draft'}`}>
            <div className="status-icon">
              {profileStatus?.hasDraft ? (
                <i className="fas fa-edit"></i>
              ) : (
                <i className="fas fa-plus"></i>
              )}
            </div>
            <div className="status-content">
              <h3>Draft Status</h3>
              <p className="status-text">
                {profileStatus?.hasDraft ? 'Has Draft' : 'No Draft'}
              </p>
              <p className="status-description">
                {profileStatus?.hasDraft 
                  ? 'You have unsaved changes in your draft'
                  : 'Create a draft to start building your profile'
                }
              </p>
              {profileStatus?.lastDraftUpdate && (
                <p className="status-date">
                  Last updated: {formatDate(profileStatus.lastDraftUpdate)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="status-actions">
          {profileStatus?.hasDraft ? (
            <>
              <button onClick={handleEditProfile} className="btn btn-primary">
                <i className="fas fa-edit"></i>
                Continue Editing
              </button>
              <button onClick={() => setCurrentView('preview')} className="btn btn-secondary">
                <i className="fas fa-eye"></i>
                Preview Draft
              </button>
            </>
          ) : (
            <button onClick={handleEditProfile} className="btn btn-primary">
              <i className="fas fa-plus"></i>
              Create Profile
            </button>
          )}

          {profileStatus?.isPublished && (
            <div className="published-info">
              <div className="info-card">
                <h4>Your Public Profile</h4>
                <p>Patients can view your published profile at:</p>
                <a 
                  href={`/doctor/${user.id}/public`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="profile-link"
                >
                  <i className="fas fa-external-link-alt"></i>
                  View Public Profile
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        {profileStatus?.isPublished && (
          <div className="quick-stats">
            <h3>Profile Statistics</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number">✓</div>
                <div className="stat-label">Profile Published</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">👥</div>
                <div className="stat-label">Visible to Patients</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">📅</div>
                <div className="stat-label">Ready for Bookings</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileManagement; 