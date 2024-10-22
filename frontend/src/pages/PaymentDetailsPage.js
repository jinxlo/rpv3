// frontend/pages/PaymentDetailsPage.js

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import '../assets/styles/PaymentDetailsPage.css';
import axios from 'axios';

const PaymentDetailsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedNumbers, method } = location.state || {
    selectedNumbers: [],
    method: '',
  };

  const [exchangeRate, setExchangeRate] = useState(null);
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error state
  const [formData, setFormData] = useState({
    fullName: '',
    idNumber: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    proofOfPayment: null,
  });

  const ticketPrice = 10;
  const totalAmountUSD = selectedNumbers.length * ticketPrice;

  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const response = await api.get('/exchange-rate');
        console.log('API Response:', response.data);

        if (response.data && response.data.data && response.data.data.dolar && response.data.data.dolar.value) {
          const usdRate = parseFloat(response.data.data.dolar.value);
          setExchangeRate(usdRate);
        } else {
          console.error('Unexpected response structure:', response.data);
          setExchangeRate(0);
        }
      } catch (error) {
        console.error('Error fetching exchange rate:', error);
        setExchangeRate(0); // Default to 0 if error occurs
      }
    };

    fetchExchangeRate();
  }, []);

  const totalAmountBS = exchangeRate
    ? (totalAmountUSD * exchangeRate).toFixed(2)
    : 'Loading...';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleProofOfPaymentChange = (e) => {
    setFormData({ ...formData, proofOfPayment: e.target.files[0] });
  };

  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true); // Start loading

    // Basic client-side validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      setLoading(false); // Stop loading
      return;
    }

    try {
      // Prepare form data for multipart/form-data
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (key !== 'confirmPassword') {
          data.append(key, formData[key]);
        }
      });
      data.append('selectedNumbers', JSON.stringify(selectedNumbers));
      data.append('method', method);
      data.append('totalAmountUSD', totalAmountUSD);

      // Make the API call to create user and reserve tickets
      const response = await axios.post('http://localhost:5000/api/payments/create-and-pay', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Create and Pay Response:', response.data);

      if (response.data.success) {
        // Store the token
        const { token, isAdmin } = response.data;
        if (token) {
          localStorage.setItem('token', token);
          localStorage.setItem('isAdmin', isAdmin);
        }

        alert('Account created and payment submitted successfully!');
        navigate('/payment-verification'); // Navigate to verification page
      } else {
        setError(response.data.message || 'Payment failed.');
      }
    } catch (error) {
      console.error('Error in handleConfirmPayment:', error);
      setError(error.response?.data?.message || 'Error confirming payment.');
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const paymentDetails = {
    'Binance Pay': {
      details: 'Binance Pay ID: 35018921',
      qrCode: '/binancepayQR.png',
      amount: totalAmountUSD,
    },
    Pagomovil: {
      details: 'Phone Number: 04122986051\nCedula: 19993150\nBanco: Banesco',
      amount: totalAmountBS,
    },
    Zelle: 'Zelle details...',
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard: ' + text);
  };

  return (
    <div className="payment-details-page">
      <h2>Payment Details</h2>
      <p>Payment Method: {method}</p>

      {method === 'Binance Pay' && (
        <>
          <p>Total Amount: ${paymentDetails['Binance Pay'].amount}</p>
          <p>{paymentDetails['Binance Pay'].details}</p>
          <img src={paymentDetails['Binance Pay'].qrCode} alt="Binance Pay QR Code" />
        </>
      )}

      {method === 'Pagomovil' && (
        <>
          <p>Total Amount: {paymentDetails['Pagomovil'].amount} BS</p>
          <p>{paymentDetails['Pagomovil'].details}</p>
          <button onClick={() => handleCopyToClipboard('04122986051')}>Copy Phone Number</button>
          <button onClick={() => handleCopyToClipboard('19993150')}>Copy Cedula</button>
        </>
      )}

      {method === 'Zelle' && (
        <>
          <p>Total Amount: ${paymentDetails['Binance Pay'].amount}</p>
          <p>{paymentDetails['Zelle']}</p>
          {/* Add Zelle QR Code or details if available */}
        </>
      )}

      <h3>Create Account and Confirm Payment</h3>

      {/* Display error message if any */}
      {error && <div className="error-message">{error}</div>}

      <form className="payment-form" onSubmit={handleConfirmPayment}>
        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          required
          value={formData.fullName}
          onChange={handleInputChange}
        />

        <input
          type="text"
          name="idNumber"
          placeholder="ID Number"
          required
          value={formData.idNumber}
          onChange={handleInputChange}
        />

        <input
          type="tel"
          name="phoneNumber"
          placeholder="Phone Number"
          required
          value={formData.phoneNumber}
          onChange={handleInputChange}
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          value={formData.email}
          onChange={handleInputChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Create Password"
          required
          value={formData.password}
          onChange={handleInputChange}
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          required
          value={formData.confirmPassword}
          onChange={handleInputChange}
        />

        <label>
          Proof of Payment:
          <input
            type="file"
            accept="image/*"
            required
            onChange={handleProofOfPaymentChange}
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Create Account and Confirm Payment'}
        </button>
      </form>
    </div>
  );
};

export default PaymentDetailsPage;
