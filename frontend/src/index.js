// index.js
import React from 'react';
import ReactDOM from 'react-dom';
import './assets/styles/index.css';  // Import global styles
import App from './App';
import { BrowserRouter as Router } from 'react-router-dom';

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>,
  document.getElementById('root')  // Ensure this matches the ID in your public/index.html file
);
