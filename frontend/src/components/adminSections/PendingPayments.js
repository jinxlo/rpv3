// src/components/adminSections/PendingPayments.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import '../../assets/styles/adminSections/PendingPayments.css';

const socket = io.connect('http://localhost:5000');

const PendingPayments = () => {
  const [payments, setPayments] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchPayments();
    
    socket.on('payment_update', (data) => {
      setPayments(data);
    });

    return () => socket.off('payment_update');
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await axios.get('/api/payments/pending');
      setPayments(response.data);
    } catch (error) {
      setMessage({ text: 'Error fetching payments', type: 'error' });
    }
  };

  const handlePaymentAction = async (paymentId, action) => {
    try {
      await axios.post(`/api/payments/${paymentId}/${action}`);
      setMessage({
        text: `Payment ${action === 'confirm' ? 'confirmed' : 'rejected'} successfully`,
        type: 'success'
      });
      
      // Update local state
      setPayments(payments.filter(payment => payment.id !== paymentId));
      
      // Notify server
      socket.emit('payment_action', { paymentId, action });
    } catch (error) {
      setMessage({ text: `Error ${action}ing payment`, type: 'error' });
    }
  };

  return (
    <div className="pending-payments">
      <h2 className="page-title">Pagos Pendientes</h2>
      <p className="page-description">Confirmar o rechazar pagos pendientes</p>

      {message.text && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      <div className="payments-table-container">
        <table className="payments-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Cantidad</th>
              <th>Fecha</th>
              <th>Número(s)</th>
              <th>Método de Pago</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td>{payment.customerName}</td>
                <td>${payment.amount}</td>
                <td>{payment.date}</td>
                <td>{payment.ticketNumbers.join(', ')}</td>
                <td>{payment.paymentMethod}</td>
                <td className="action-buttons">
                  <button
                    className="confirm-button"
                    onClick={() => handlePaymentAction(payment.id, 'confirm')}
                  >
                    Confirmar
                  </button>
                  <button
                    className="reject-button"
                    onClick={() => handlePaymentAction(payment.id, 'reject')}
                  >
                    Rechazar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PendingPayments;