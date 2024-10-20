// src/pages/PaymentDetailsPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api'; // Use your Axios instance with baseURL set to your backend
import '../assets/styles/PaymentDetailsPage.css';

const PaymentDetailsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedNumbers, method } = location.state || {
    selectedNumbers: [],
    method: '',
  };
  const [exchangeRate, setExchangeRate] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    idNumber: '',
    phoneNumber: '',
    email: '',
    proofOfPayment: null,
  });

  const ticketPrice = 10;
  const totalAmountUSD = selectedNumbers.length * ticketPrice;

  useEffect(() => {
    // Fetch exchange rate from your backend
    const fetchExchangeRate = async () => {
      try {
        const response = await api.get('/exchange-rate');
        const usdRate = response.data.USD.transferencia;
        setExchangeRate(usdRate);
      } catch (error) {
        console.error('Error fetching exchange rate:', error);
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
    try {
      // Prepare form data
      const data = new FormData();
      data.append('fullName', formData.fullName);
      data.append('idNumber', formData.idNumber);
      data.append('phoneNumber', formData.phoneNumber);
      data.append('email', formData.email);
      data.append('proofOfPayment', formData.proofOfPayment);
      data.append('selectedNumbers', JSON.stringify(selectedNumbers));
      data.append('method', method);
      data.append('totalAmountUSD', totalAmountUSD);

      // Send to backend using your Axios instance
      await api.post('/payments/confirm', data);

      // Navigate to verification page
      navigate('/payment-verification');
    } catch (error) {
      console.error('Payment confirmation error:', error);
      alert('Error confirming payment');
    }
  };

  // Bank details based on the payment method
  const bankDetails = {
    'Binance Pay': 'Binance Pay details...',
    Pagomovil: 'Pagomovil details...',
    Zelle: 'Zelle details...',
  };

  return (
    <div className="payment-details-page">
      <h2>Payment Details</h2>
      <p>Payment Method: {method}</p>
      <p>Total Amount: ${totalAmountUSD}</p>
      <p>Total in Bolívares: {totalAmountBS} BS</p>

      <h3>Bank Details</h3>
      <p>{bankDetails[method]}</p>

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
        <label>
          Proof of Payment:
          <input
            type="file"
            accept="image/*"
            required
            onChange={handleProofOfPaymentChange}
          />
        </label>
        <button type="submit">Confirm Payment</button>
      </form>
    </div>
  );
};

export default PaymentDetailsPage;
