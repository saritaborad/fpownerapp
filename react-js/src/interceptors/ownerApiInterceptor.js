import Axios from 'axios';
import environment from '../environments/environment';
import { authService } from '../services/authService';

Axios.interceptors.request.use(
  (config) => {
    if (config.url.includes(environment.frankPorterApi)) {
      config.headers.Authorization = `${authService.getBasicAuth(
        environment.apiUsername,
        environment.apiPassword
      )}`;
      const user = authService.getUser();
      if (user) {
        config.headers['x-owner'] = user.userId;
      }
      config.headers['x-version'] = process.env.REACT_APP_VERSION;
    }

    return config;
  },
  (error) => Promise.reject(error)
);
