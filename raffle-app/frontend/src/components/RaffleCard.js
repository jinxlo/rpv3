// src/components/RaffleCard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import socket from '../socket'; // Ensure socket.io is configured properly
import '../assets/styles/RaffleCard.css'; // Import CSS specific to RaffleCard

const RaffleCard = ({ onBuyTickets }) => {
  const [raffleItem, setRaffleItem] = useState({
    id: '1',
    productName: 'Moto BMW 1000cc',
    productImage:
      'https://imgd.aeplcdn.com/1056x594/n/bw/models/colors/bmw-select-model-light-white-1677058607620.jpg?q=80',
    price: 10,
    totalTickets: 1000,
    soldTickets: [],
    pendingTickets: [],
  });

  const [ticketsAvailable, setTicketsAvailable] = useState(raffleItem.totalTickets);

  useEffect(() => {
    const fetchRaffle = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/raffle'); // Update API endpoint
        setRaffleItem(response.data);
        setTicketsAvailable(
          response.data.totalTickets - response.data.soldTickets.length
        );
      } catch (error) {
        console.error('Error fetching raffle:', error);
      }
    };

    fetchRaffle();

    // Update raffle data every 5 seconds
    const interval = setInterval(fetchRaffle, 5000);

    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, []);

  // Calculate progress percentage
  const progress =
    ((raffleItem.totalTickets - ticketsAvailable) / raffleItem.totalTickets) * 100;

  return (
    <div className="raffle-card">
      <img
        src={raffleItem.productImage}
        alt={raffleItem.productName}
        className="raffle-image"
      />
      <h2 className="raffle-name">{raffleItem.productName}</h2>
      <p className="raffle-description">Experience the thrill of a lifetime!</p>
      <div className="raffle-info">
        <p className="raffle-price">
          Price per Ticket: <span>${raffleItem.price}</span>
        </p>
        <p className="raffle-tickets">
          Tickets Available: <span>{ticketsAvailable}</span>
        </p>
        <p className="raffle-total-tickets">
          Total Tickets: <span>{raffleItem.totalTickets}</span>
        </p>
      </div>
      <div className="progress-bar-container">
        <div className="progress-bar">
          <div
            className="progress"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="progress-text">{`${Math.floor(progress)}% Sold`}</p>
      </div>
      <button
        className="buy-ticket-button"
        onClick={() => onBuyTickets(1)} // Adjust quantity as needed
        disabled={ticketsAvailable === 0}
      >
        {ticketsAvailable > 0 ? 'Comprar Tickets' : 'Sold Out'}
      </button>
    </div>
  );
};

export default RaffleCard;
