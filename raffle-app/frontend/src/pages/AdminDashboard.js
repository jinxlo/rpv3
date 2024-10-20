import React from 'react'; 
import Sidebar from '../components/Sidebar';
import RaffleSection from '../components/RaffleSection';
import UserSection from '../components/UserSection';
import SalesSection from '../components/SalesSection';
import '../assets/styles/AdminDashboard.css';  // Assuming CSS for Admin Dashboard is here

const AdminDashboard = () => {
    return (
        <div className="admin-dashboard">
            <Sidebar />
            <div className="dashboard-content">
                <h1>Admin Dashboard</h1>

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
