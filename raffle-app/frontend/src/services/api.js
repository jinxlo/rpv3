import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Fetch all raffles
export const getRaffles = async () => {
    const response = await axios.get(`${API_URL}/raffles`);
    return response.data;
};

// Create a new raffle
export const createRaffle = async (raffleData) => {
    const response = await axios.post(`${API_URL}/raffles`, raffleData);
    return response.data;
};

// Purchase tickets
export const purchaseTicket = async (raffleId, purchaseData) => {
    const response = await axios.post(`${API_URL}/raffles/${raffleId}/purchase`, purchaseData);
    return response.data;
};
