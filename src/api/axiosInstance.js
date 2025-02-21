import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create an Axios instance
const api = axios.create({
  baseURL: 'http://192.168.53.151:8000/api/v1', // Replace with your API URL
});

// Add an interceptor to include Bearer token in the Authorization header for each request
api.interceptors.request.use(
  async config => {
    // // Retrieve the token from AsyncStorage (or wherever it's stored)
    // const token = await AsyncStorage.getItem('token');

    // // If token exists, set it in the Authorization header
    // if (token) {
    //   config.headers['Authorization'] = `Bearer ${token}`;
    // }
    config.headers[
      'Authorization'
    ] = `Bearer tt793cqBV3JffiVbm4sVOJ33ghcXB5IrWiFTo4oRsgIq9LPZpUU31bpBLjWjECGj`;

    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

// Export the Axios instance to use in other parts of the app
export default api;
