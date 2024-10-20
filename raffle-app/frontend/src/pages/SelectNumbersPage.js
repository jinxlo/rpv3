import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import socket from '../socket';
import '../assets/styles/SelectNumbersPage.css';

const SelectNumbersPage = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const navigate = useNavigate();
  const ticketPrice = 10; // Price per ticket

  useEffect(() => {
    // Fetch initial ticket data
    const fetchTickets = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/tickets');
        setTickets(response.data);
      } catch (error) {
        console.error('Error fetching tickets:', error);
      }
    };

    fetchTickets();

    // Set up Socket.io listeners for real-time updates
    socket.on('ticketsReserved', (data) => {
      const updatedTickets = tickets.map((ticket) => {
        if (data.tickets.includes(ticket.ticketNumber)) {
          return { ...ticket, status: 'reserved' }; // Status for pending payment (grey)
        }
        return ticket;
      });
      setTickets(updatedTickets);
    });

    socket.on('ticketsSold', (data) => {
      const updatedTickets = tickets.map((ticket) => {
        if (data.tickets.includes(ticket.ticketNumber)) {
          return { ...ticket, status: 'sold' }; // Status for purchased (red)
        }
        return ticket;
      });
      setTickets(updatedTickets);
    });

    socket.on('ticketsReleased', (data) => {
      const updatedTickets = tickets.map((ticket) => {
        if (data.tickets.includes(ticket.ticketNumber)) {
          return { ...ticket, status: 'available' }; // Status for available tickets
        }
        return ticket;
      });
      setTickets(updatedTickets);
    });

    // Cleanup on unmount
    return () => {
      socket.off('ticketsReserved');
      socket.off('ticketsSold');
      socket.off('ticketsReleased');
    };
  }, [tickets]);

  const handleNumberClick = (number) => {
    if (selectedNumbers.includes(number)) {
      setSelectedNumbers(selectedNumbers.filter((n) => n !== number));
    } else {
      setSelectedNumbers([...selectedNumbers, number]);
    }
  };

  const handleContinue = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/tickets/reserve', {
        userId: 'user123', // Replace with actual user ID
        tickets: selectedNumbers,
      });

      if (response.data.success) {
        navigate('/payment-method', { state: { selectedNumbers } });
      } else {
        alert(response.data.message);
        // Refresh tickets data
        const ticketResponse = await axios.get('http://localhost:5000/api/tickets');
        setTickets(ticketResponse.data);
      }
    } catch (error) {
      console.error('Error reserving tickets:', error);
    }
  };

  return (
    <div className="select-numbers-page">
      <div className="numbers-grid">
        {tickets.map((ticket) => (
          <button
            key={ticket.ticketNumber}
            className={`number-button ${
              selectedNumbers.includes(ticket.ticketNumber) ? 'selected' : ''
            } ${
              ticket.status === 'sold' ? 'purchased' : 
              ticket.status === 'reserved' ? 'unavailable' : ''
            }`}
            onClick={() => handleNumberClick(ticket.ticketNumber)}
            disabled={ticket.status !== 'available'}
          >
            {ticket.ticketNumber}
          </button>
        ))}
      </div>

      {/* Sticky Summary */}
      <div className="sticky-summary">
        <p>Total Amount: ${selectedNumbers.length * ticketPrice}</p>
        <p>Selected Numbers: {selectedNumbers.join(', ') || 'None'}</p>
        <button onClick={handleContinue} disabled={selectedNumbers.length === 0}>
          Continue to Payment
        </button>
      </div>
    </div>
  );
};

export default SelectNumbersPage;
