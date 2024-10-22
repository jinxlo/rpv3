// src/components/RaffleCard.js
import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { SocketContext } from '../index';
import '../assets/styles/RaffleCard.css';

const RaffleCard = ({ onBuyTickets }) => {
  const socket = useContext(SocketContext);
  
  // Initialize state with loading values
  const [raffleItem, setRaffleItem] = useState({
    id: '1',
    productName: 'Loading...',
    productImage: '',
    price: 0,
    totalTickets: 0,
    soldTickets: 0,
    reservedTickets: 0,
  });

  const [ticketsAvailable, setTicketsAvailable] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Calculate available tickets
  const updateAvailableTickets = useCallback((data) => {
    const available = data.totalTickets - (data.soldTickets + data.reservedTickets);
    setTicketsAvailable(available);
  }, []);

  useEffect(() => {
    // Function to fetch raffle and ticket data
    const fetchRaffleData = async () => {
      try {
        setLoading(true);
        console.log('Fetching raffle data...');
        
        // Fetch the active raffle
        const response = await axios.get('http://localhost:5000/api/raffle');
        console.log('Raffle data received:', response.data);
        
        // Update state with the fetched data
        setRaffleItem(response.data);
        updateAvailableTickets(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching raffle:', error.response || error);
        setError('Failed to load raffle data');
      } finally {
        setLoading(false);
      }
    };

    fetchRaffleData();

    // Set up Socket.IO listeners for real-time updates
    socket.on('ticketsReserved', (data) => {
      console.log('Tickets reserved:', data);
      setRaffleItem(prevState => {
        const newState = {
          ...prevState,
          reservedTickets: prevState.reservedTickets + data.tickets.length
        };
        updateAvailableTickets(newState);
        return newState;
      });
    });

    socket.on('ticketsReleased', (data) => {
      console.log('Tickets released:', data);
      setRaffleItem(prevState => {
        const newState = {
          ...prevState,
          reservedTickets: Math.max(0, prevState.reservedTickets - data.tickets.length)
        };
        updateAvailableTickets(newState);
        return newState;
      });
    });

    socket.on('ticketsSold', (data) => {
      console.log('Tickets sold:', data);
      setRaffleItem(prevState => {
        const newState = {
          ...prevState,
          soldTickets: prevState.soldTickets + data.tickets.length,
          reservedTickets: prevState.reservedTickets - data.tickets.length
        };
        updateAvailableTickets(newState);
        return newState;
      });
    });

    // Cleanup socket listeners on unmount
    return () => {
      socket.off('ticketsReserved');
      socket.off('ticketsReleased');
      socket.off('ticketsSold');
    };
  }, [socket, updateAvailableTickets]);

  // Calculate progress percentage
  const progress = ((raffleItem.totalTickets - ticketsAvailable) / raffleItem.totalTickets) * 100;

  if (loading) {
    return (
      <div className="raffle-card loading">
        <div className="loading-spinner"></div>
        <p>Cargando rifa...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="raffle-card error">
        <p className="error-message">{error}</p>
      </div>
    );
  }

  return (
    <div className="raffle-card">
      <img
        src={raffleItem.productImage}
        alt={raffleItem.productName}
        className="raffle-image"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = '/placeholder-image.jpg'; // Fallback image
        }}
      />

      <h2 className="raffle-name">{raffleItem.productName}</h2>
      <p className="raffle-description">¡Experimenta la emoción de tu vida!</p>

      <div className="raffle-info">
        <p className="raffle-price">
          Precio por Ticket: <span>${raffleItem.price}</span>
        </p>
        <p className="raffle-tickets">
          Tickets Disponibles: <span>{ticketsAvailable}</span>
        </p>
        <p className="raffle-total-tickets">
          Tickets Total: <span>{raffleItem.totalTickets}</span>
        </p>
      </div>

      <div className="progress-bar-container">
        <div className="progress-bar">
          <div
            className="progress"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="progress-text">{`${Math.floor(progress)}% Vendido`}</p>
      </div>

      <button
        className="buy-ticket-button"
        onClick={() => onBuyTickets(1)}
        disabled={ticketsAvailable === 0}
      >
        {ticketsAvailable > 0 ? 'Comprar Tickets' : 'Agotado'}
      </button>
    </div>
  );
};

export default RaffleCard;