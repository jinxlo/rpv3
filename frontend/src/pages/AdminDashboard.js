// src/pages/AdminDashboard.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import RaffleSection from '../components/RaffleSection';
import UserSection from '../components/UserSection';
import SalesSection from '../components/SalesSection';
import '../assets/styles/AdminDashboard.css'; // Assuming CSS for Admin Dashboard is here

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear localStorage and navigate to login page
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    navigate('/login');
  };

  return (
    <div className="admin-dashboard">
      <Sidebar />
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
        <div className="section-wrapper">
          {/* User Section */}
          <div className="dashboard-section">
            <UserSection />
          </div>

          {/* Raffle Section */}
          <div className="dashboard-section">
            <RaffleSection />
          </div>

          {/* Sales Section */}
          <div className="dashboard-section">
            <SalesSection />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
