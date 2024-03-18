import Axios from 'axios';
import environment from '../environments/environment';
import { authService } from '../services/authService';

const MAX_ERRORS = 5;

Axios.interceptors.request.use(
  (config) => {
    if (
      (config.url.includes(environment.guestyApi) || config.url.includes(environment.guestyApi2)) &&
      !localStorage.getItem('admin_session_token')
    ) {
      config.headers.Authorization = `Bearer ${authService.getUserToken()}`;
    }
    if (
      (config.url.includes(environment.guestyApi) || config.url.includes(environment.guestyApi2)) &&
      localStorage.getItem('admin_session_token')
    ) {
      const authKey = btoa(`${environment.guestyApiKey}:${environment.guestyApiSecret}`);
      config.headers.Authorization = `Basic ${authKey}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

const specialAxios = Axios.create();
specialAxios.interceptors.request.use(
  (config) => {
    const authKey = btoa(`${environment.guestyApiKey}:${environment.guestyApiSecret}`);
    config.headers.Authorization = `Basic ${authKey}`;

    return config;
  },
  (error) => Promise.reject(error)
);

const errorRequests = [];

// special method for handling guesty erros
const handleError = (error, response) => {
  const errorRequest =
    (error && error.message === 'Network Error') || (response && response.data.err !== undefined);
  const requestUrl = error && error.config ? error.config.url : response.config.url;
  const hadError = errorRequests.find((request) => request.url === requestUrl);
  if (errorRequest && (!hadError || hadError.errors < MAX_ERRORS)) {
    if (hadError) {
      hadError.errors += 1;
    } else {
      errorRequests.push({ url: requestUrl, errors: 2 });
    }

    return true;
  }
  if (errorRequest && hadError.errors >= MAX_ERRORS) {
    clearErrorOnComplete(error || response);

    return false;
  }

  return false;
};

// special method for handling guesty erros
const clearErrorOnComplete = (response) => {
  const hadError = errorRequests.findIndex((request) => request.url === response.config.url);

  if (hadError > -1) {
    errorRequests.splice(hadError, 1);
  }
};

Axios.interceptors.response.use(
  (response) => {
    if (
      response &&
      (response.config.url.includes(environment.guestyApi) ||
        response.config.url.includes(environment.guestyApi2))
    ) {
      if (handleError(undefined, response)) {
        // repeat request if response returns 200, but object err: {} is passed
        return Axios.request(response.config);
      }
      if (response.data.err === undefined) {
        clearErrorOnComplete(response);
      }
    }

    return response;
  },
  (error) => {
    if (
      error.response &&
      (error.response.config.url.includes(environment.guestyApi) ||
        error.response.config.url.includes(environment.guestyApi2))
    ) {
      if (authService.getAdminToken()) {
        authService.authorizeAdmin(authService.getAdminToken());
      }
      if (handleError(error)) {
        // repeat request if response returns message "Network Error" - guesty does not return 5** code
        return Axios.request(error.config);
      }
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

export { specialAxios };
