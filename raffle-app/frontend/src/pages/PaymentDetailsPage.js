// src/pages/PaymentDetailsPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
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
    // Fetch exchange rate
    const fetchExchangeRate = async () => {
      try {
        const response = await axios.get(
          'https://bcv-exchange-rates.vercel.app/get_exchange_rates'
        );
        const usdRate = response.data.USD.transferencia; // Adjust based on API response
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

  const handleConfirmPayment = (e) => {
    e.preventDefault();
    // Process payment and form data
    navigate('/payment-verification');
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
