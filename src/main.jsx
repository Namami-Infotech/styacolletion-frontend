import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import Cookies from 'js-cookie'
import './index.css'
import App from './App.jsx'

axios.interceptors.request.use(
  (config) => {
    const token = Cookies.get('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
