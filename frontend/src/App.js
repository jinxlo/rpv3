// src/App.js
import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AdminLayout from './components/layouts/AdminLayout';
import DashboardOverview from './components/adminSections/DashboardOverview';
import PendingPayments from './components/adminSections/PendingPayments';
import CreateRaffle from './components/adminSections/CreateRaffle';
import ActiveRaffles from './components/adminSections/ActiveRaffles';
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
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const adminStatus = localStorage.getItem('isAdmin') === 'true';
      
      setIsAuthenticated(!!token);
      setIsAdmin(adminStatus);
    };

    checkAuth();
  }, [location]);

  const ProtectedAdminRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace state={{ from: location }} />;
    }

    if (!isAdmin) {
      return <Navigate to="/" replace />;
    }

    return children;
  };

  return (
    <div className="app">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/select-numbers" element={<SelectNumbersPage />} />
        <Route path="/payment-method" element={<PaymentMethodPage />} />
        <Route path="/payment-details" element={<PaymentDetailsPage />} />
        <Route path="/payment-verification" element={<PaymentVerificationPage />} />
        <Route 
          path="/login" 
          element={
            isAuthenticated ? (
              <Navigate to={isAdmin ? "/admin" : "/"} replace />
            ) : (
              <Login />
            )
          } 
        />

        {/* Admin Routes - Now nested under /admin */}
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminLayout />
            </ProtectedAdminRoute>
          }
        >
          <Route index element={<DashboardOverview />} />
          <Route path="pending-payments" element={<PendingPayments />} />
          <Route path="create-raffle" element={<CreateRaffle />} />
          <Route path="active-raffles" element={<ActiveRaffles />} />
        </Route>

        {/* Catch-all Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default App;