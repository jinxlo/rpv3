// src/App.js
import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import HomePage from './pages/HomePage';
import SelectNumbersPage from './pages/SelectNumbersPage';
import PaymentMethodPage from './pages/PaymentMethodPage';
import PaymentDetailsPage from './pages/PaymentDetailsPage';
import PaymentVerificationPage from './pages/PaymentVerificationPage';
import './assets/styles/App.css';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const adminStatus = localStorage.getItem('isAdmin') === 'true';

    setIsAuthenticated(!!token);
    setIsAdmin(adminStatus);
  }, [location]);

  return (
    <div className="app">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/select-numbers" element={<SelectNumbersPage />} />
        <Route path="/payment-method" element={<PaymentMethodPage />} />
        <Route path="/payment-details" element={<PaymentDetailsPage />} />
        <Route path="/payment-verification" element={<PaymentVerificationPage />} />
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />} />

        {/* Protected Admin Route */}
        <Route
          path="/admin-dashboard"
          element={
            isAuthenticated && isAdmin ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Catch-All Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default App;
