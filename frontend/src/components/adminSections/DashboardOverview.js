// src/components/adminSections/DashboardOverview.js
import React from 'react';
import { DollarSign, Users, Package } from 'lucide-react';
import '../../assets/styles/adminSections/DashboardOverview.css';

const DashboardOverview = () => {
  const summaryData = [
    {
      title: 'Ventas Totales',
      value: '$17500',
      change: '+20.1% desde el mes pasado',
      icon: <DollarSign className="summary-icon" />
    },
    {
      title: 'Pagos Confirmados',
      value: '3',
      change: '+180.1% desde la última hora',
      icon: <Users className="summary-icon" />
    },
    {
      title: 'Rifas Activas',
      value: '3',
      change: '+19% desde el mes pasado',
      icon: <Package className="summary-icon" />
    }
  ];

  return (
    <div className="dashboard-overview">
      <h2 className="page-title">Panel de Control</h2>

      {/* Summary Cards */}
      <div className="summary-cards">
        {summaryData.map((item, index) => (
          <div key={index} className="summary-card">
            <div className="card-header">
              <h3 className="card-title">{item.title}</h3>
              {item.icon}
            </div>
            <div className="card-value">{item.value}</div>
            <p className="card-change">{item.change}</p>
          </div>
        ))}
      </div>

      {/* Raffle Numbers Grid */}
      <div className="numbers-section">
        <h3 className="section-title">Resumen de Números de Rifa</h3>
        <div className="numbers-grid">
          {Array.from({ length: 100 }, (_, i) => (
            <div
              key={i + 1}
              className={`number-cell ${Math.random() > 0.3 ? 'available' : 'taken'}`}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;