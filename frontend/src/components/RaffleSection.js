import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import '../assets/styles/RaffleSection.css';  // Assuming the CSS for this component exists

const socket = io.connect('http://localhost:5000');  // Update this URL as per your backend setup

const RaffleSection = () => {
  const [raffleName, setRaffleName] = useState('');
  const [raffleImage, setRaffleImage] = useState(null);
  const [ticketPrice, setTicketPrice] = useState('');
  const [totalTickets, setTotalTickets] = useState('');
  const [message, setMessage] = useState('');
  const [realTimeUpdates, setRealTimeUpdates] = useState({});

  // Listen for real-time updates via Socket.IO
  useEffect(() => {
    socket.on('raffle_update', (data) => {
      setRealTimeUpdates(data);  // Update state with real-time data
    });

    return () => {
      socket.off('raffle_update');  // Clean up socket on component unmount
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure an image is uploaded
    if (!raffleImage) {
      setMessage('Please upload an image for the raffle.');
      return;
    }

    const formData = new FormData();
    formData.append('raffle_name', raffleName);
    formData.append('raffle_image', raffleImage);
    formData.append('ticket_price', ticketPrice);
    formData.append('total_tickets', totalTickets);

    try {
      const response = await axios.post('/api/raffles', formData);
      if (response.status === 200) {
        setMessage('Raffle created successfully!');
        socket.emit('raffle_created', { raffleName, ticketPrice, totalTickets });  // Emit an event
        resetForm();  // Reset the form on success
      } else {
        setMessage('Failed to create raffle.');
      }
    } catch (error) {
      console.error('Error creating raffle:', error);
      setMessage('Error creating raffle, please try again.');
    }
  };

  // Reset the form after submission
  const resetForm = () => {
    setRaffleName('');
    setRaffleImage(null);
    setTicketPrice('');
    setTotalTickets('');
    setMessage('');
  };

  return (
    <div className="raffle-section">
      <h2>Create New Raffle</h2>
      {message && <p className="message">{message}</p>}  {/* Display any message */}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Raffle Name</label>
          <input
            type="text"
            className="form-control"
            value={raffleName}
            onChange={(e) => setRaffleName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Raffle Image</label>
          <input
            type="file"
            className="form-control"
            onChange={(e) => setRaffleImage(e.target.files[0])}
            required
          />
        </div>

        <div className="form-group">
          <label>Price Per Ticket</label>
          <input
            type="number"
            className="form-control"
            value={ticketPrice}
            onChange={(e) => setTicketPrice(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Total Number of Tickets</label>
          <input
            type="number"
            className="form-control"
            value={totalTickets}
            onChange={(e) => setTotalTickets(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary">Create Raffle</button>
      </form>

      <div className="real-time-updates">
        <h3>Real-Time Updates</h3>
        <p>{JSON.stringify(realTimeUpdates)}</p>  {/* Display real-time updates */}
      </div>
    </div>
  );
};

export default RaffleSection;
