// index.js
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import socketIO from 'socket.io-client';

// Initialize Socket.io client
const socket = socketIO('http://localhost:5000');

// Make socket globally accessible
export const SocketContext = React.createContext();

ReactDOM.render(
  <React.StrictMode>
    <SocketContext.Provider value={socket}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </SocketContext.Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
