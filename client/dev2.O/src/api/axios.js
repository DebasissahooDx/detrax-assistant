import axios from 'axios';

const api = axios.create({
  // IMPORTANT: Add /api at the end if your backend routes are prefixed
  baseURL: "https://detrax-assistant.onrender.com/api" 
});

export default api;