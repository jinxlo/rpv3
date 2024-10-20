import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import '../assets/styles/SalesSection.css';  // Assuming this file is for styles

const socket = io.connect('http://localhost:5000');  // Adjust the URL as per your backend

const SalesSection = () => {
  const [sales, setSales] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch initial sales data
    const fetchSales = async () => {
      try {
        const response = await axios.get('/api/sales');
        setSales(response.data);
      } catch (error) {
        console.error('Error fetching sales:', error);
        setMessage('Error fetching sales data.');
      }
    };

    fetchSales();

    // Set up real-time sales updates
    socket.on('sales_update', (data) => {
      setSales(data);
    });

    return () => {
      socket.off('sales_update'); // Clean up the socket listener on unmount
    };
  }, []);

  const handleConfirm = async (saleId) => {
    try {
      await axios.post(`/api/sales/${saleId}/confirm`);
      setMessage('Sale confirmed successfully!');
      
      // Update the specific sale in the local state
      setSales((prevSales) => 
        prevSales.map((sale) =>
          sale.id === saleId ? { ...sale, status: 'Confirmed' } : sale
        )
      );

      socket.emit('sale_confirmed', saleId);  // Notify the server to update clients
    } catch (error) {
      console.error('Error confirming sale:', error);
      setMessage('Error confirming sale.');
    }
  };

  const handleReject = async (saleId) => {
    try {
      await axios.post(`/api/sales/${saleId}/reject`);
      setMessage('Sale rejected.');

      // Update the specific sale in the local state
      setSales((prevSales) => 
        prevSales.map((sale) =>
          sale.id === saleId ? { ...sale, status: 'Rejected' } : sale
        )
      );

      socket.emit('sale_rejected', saleId);  // Notify the server to update clients
    } catch (error) {
      console.error('Error rejecting sale:', error);
      setMessage('Error rejecting sale.');
    }
  };

  return (
    <div className="sales-section">
      <h2>Sales</h2>
      {message && <p className="message">{message}</p>}
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Purchase ID</th>
            <th>User</th>
            <th>Raffle</th>
            <th>Numbers</th>
            <th>Status</th>
            <th>Payment Method</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sales.length > 0 ? (
            sales.map((sale) => (
              <tr key={sale.id}>
                <td>{sale.id}</td>
                <td>{sale.user_full_name}</td>
                <td>{sale.raffle_name}</td>
                <td>{sale.numbers_selected}</td>
                <td>{sale.status}</td>
                <td>{sale.payment_method}</td>
                <td>
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => handleConfirm(sale.id)}
                    disabled={sale.status === 'Confirmed'}  // Disable if already confirmed
                  >
                    Confirm
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleReject(sale.id)}
                    disabled={sale.status === 'Rejected'}  // Disable if already rejected
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7">No sales found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SalesSection;
