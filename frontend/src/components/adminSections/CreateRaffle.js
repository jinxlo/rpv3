// src/components/adminSections/CreateRaffle.js
import React, { useState } from 'react';
import '../../assets/styles/adminSections/CreateRaffle.css';

const CreateRaffle = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ticketPrice: '',
    totalTickets: '',
    productImage: null
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Handle raffle creation
  };

  return (
    <div className="create-raffle">
      <h2 className="page-title">Crear Nueva Rifa</h2>
      <p className="page-description">Configurar un nuevo evento de rifa</p>

      <div className="form-container">
        <form onSubmit={handleSubmit} className="raffle-form">
          <div className="form-group">
            <label htmlFor="name">Nombre de la Rifa</label>
            <input
              type="text"
              id="name"
              placeholder="Ingrese el nombre de la rifa"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Descripción</label>
            <textarea
              id="description"
              placeholder="Ingrese la descripción de la rifa"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="ticketPrice">Precio por Ticket</label>
              <input
                type="number"
                id="ticketPrice"
                placeholder="Ingrese el precio del ticket"
                value={formData.ticketPrice}
                onChange={(e) => setFormData({...formData, ticketPrice: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label htmlFor="totalTickets">Cantidad Total de Tickets</label>
              <input
                type="number"
                id="totalTickets"
                placeholder="Ingrese el total de tickets"
                value={formData.totalTickets}
                onChange={(e) => setFormData({...formData, totalTickets: e.target.value})}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="productImage">Imagen del Producto de la Rifa</label>
            <input
              type="file"
              id="productImage"
              accept="image/*"
              onChange={(e) => setFormData({...formData, productImage: e.target.files[0]})}
            />
          </div>

          <button type="submit" className="submit-button">
            Crear Rifa
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateRaffle;