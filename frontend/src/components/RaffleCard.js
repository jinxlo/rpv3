// src/components/RaffleCard.js

import React, { useState, useEffect, useContext, useCallback } from 'react';

import axios from 'axios';

import { SocketContext } from '../index'; // Ensure this path is correct

import '../assets/styles/RaffleCard.css'; // Import CSS specific to RaffleCard



const RaffleCard = ({ onBuyTickets }) => {

  const socket = useContext(SocketContext);

  const [raffleItem, setRaffleItem] = useState({

    id: '1',

    productName: 'Moto KTM Duke 0KM',

    productImage:

      'https://comprarmoto.com.ar/wp-content/uploads/2024/01/PHO_BIKE_DET_MY24-KTM-250-DUKE-BODYWORK_SALL_AEPI_V1.png',

    price: 10,

    totalTickets: 1000,

    soldTickets: 0,

    reservedTickets: 0,

  });



  const [ticketsAvailable, setTicketsAvailable] = useState(raffleItem.totalTickets);

  const updateAvailableTickets = useCallback((data = raffleItem) => {
    const available = data.totalTickets - (data.soldTickets + data.reservedTickets);
    setTicketsAvailable(available);
  }, [raffleItem]);



  useEffect(() => {

    const fetchRaffleData = async () => {

      try {

        const response = await axios.get('http://localhost:5000/api/raffle');

        setRaffleItem(response.data);

        updateAvailableTickets(response.data);

      } catch (error) {

        console.error('Error fetching raffle:', error);

      }

    };



    fetchRaffleData();

    // Set up Socket.IO listeners
    socket.on('ticketsReserved', (data) => {
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
      setRaffleItem(prevState => {
        const newState = {
          ...prevState,
          reservedTickets: Math.max(0, prevState.reservedTickets - data.tickets.length)
        };
        updateAvailableTickets(newState);
        return newState;
      });
    });

    // Clean up listeners on unmount
    return () => {
      socket.off('ticketsReserved');
      socket.off('ticketsReleased');
    };

  }, [socket, updateAvailableTickets]);



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

        onClick={() => onBuyTickets(1)} // Adjust quantity as needed

        disabled={ticketsAvailable === 0}

      >

        {ticketsAvailable > 0 ? 'Comprar Tickets' : 'Sold Out'}

      </button>

    </div>

  );

};



export default RaffleCard;



