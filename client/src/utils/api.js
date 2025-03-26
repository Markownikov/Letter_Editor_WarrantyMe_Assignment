import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const saveLetterToGoogleDrive = async (content, title, fileId, accessToken) => {
  try {
    const response = await api.post('/save-letter', {
      content,
      title,
      fileId,
      accessToken
    });
    return response.data;
  } catch (error) {
    console.error('Error saving letter:', error);
    throw error;
  }
};

export const fetchLetters = async (accessToken) => {
  try {
    const response = await api.get('/letters', {
      params: { accessToken }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching letters:', error);
    throw error;
  }
};

export const fetchLetter = async (id, accessToken) => {
  try {
    const response = await api.get(`/letter/${id}`, {
      params: { accessToken }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching letter:', error);
    throw error;
  }
};

export default api;
