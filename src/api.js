// frontend/src/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
});

export const getAutomaton = () => API.get('/automaton');
export const saveAutomaton = (data) => API.post('/automaton', data);
