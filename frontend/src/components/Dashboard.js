import React from 'react';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <h2>Parchi</h2>
        </div>
        <div className="nav-user">
          <span>Welcome, {user?.name}</span>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </nav>

      <main className="dashboard-main">
        <div className="dashboard-content">
          <h1>Welcome to Your Dashboard</h1>
          <p>You have successfully logged in!</p>
          
          <div className="user-info">
            <h3>Your Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Name:</label>
                <span>{user?.name}</span>
              </div>
              <div className="info-item">
                <label>Email:</label>
                <span>{user?.email}</span>
              </div>
              <div className="info-item">
                <label>Role:</label>
                <span>{user?.role}</span>
              </div>
            </div>
          </div>

          <div className="dashboard-actions">
            <h3>Quick Actions</h3>
            <div className="action-buttons">
              <button className="action-button">View Profile</button>
              <button className="action-button">Settings</button>
              <button className="action-button">Help</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 