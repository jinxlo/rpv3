// App.js
import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    console.log('Authentication status:', !!token);
  }, []);

  return (
    <div className="app">
      <Routes>
        {/* Public Route: Home Page */}
        <Route path="/" element={<HomePage />} />

        {/* Public Route: Select Numbers Page */}
        <Route path="/select-numbers" element={<SelectNumbersPage />} />

        {/* Public Route: Payment Method Selection Page */}
        <Route path="/payment-method" element={<PaymentMethodPage />} />

        {/* Public Route: Payment Details Page */}
        <Route path="/payment-details" element={<PaymentDetailsPage />} />

        {/* Public Route: Payment Verification Page */}
        <Route path="/payment-verification" element={<PaymentVerificationPage />} />

        {/* Login Route: Only accessible when not logged in */}
        <Route
          path="/login"
          element={!isAuthenticated ? <Login /> : <Navigate to="/admin-dashboard" />}
        />

        {/* Admin Dashboard Route: Only accessible when logged in */}
        <Route
          path="/admin-dashboard"
          element={isAuthenticated ? <AdminDashboard /> : <Navigate to="/login" />}
        />

        {/* Fallback Route: Redirect to Home Page */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
};

export default App;
