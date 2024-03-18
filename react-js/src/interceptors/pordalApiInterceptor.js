import Axios from 'axios';
import environment from '../environments/environment';
import { authService } from '../services/authService';

Axios.interceptors.request.use(
  (config) => {
    if (config.url.includes(environment.pordalApi)) {
      const token = authService.getUserToken();

      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);
Axios.interceptors.response.use(
  (config) => config,
  (error) => {
    if (error.response && error.response.config.url.includes(environment.pordalApi)) {
      if (!error.response.config.url.includes('authenticate')) {
        if (error.response.status === 401) {
          authService.logoutProceed();
          window.location.reload();
        }
      }
    }

    return Promise.reject(error);
  }
);
