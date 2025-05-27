import axios from 'axios';

const api = axios.create({
    baseURL: `http://${import.meta.env.VITE_SERVER_ADDRESS}:${import.meta.env.VITE_SERVER_PORT}`,
    withCredentials: true
})

export default api;