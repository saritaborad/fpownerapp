import Axios from 'axios';
import {
  ADMIN_ACCESS_TOKEN_NAME,
  ADMIN_TOKEN_NAME,
  PORDAL_TOKEN_CONFIG,
  USER_SESSION,
  USER_TOKEN_NAME,
} from 'helpers/const';
import environment from '../environments/environment';

export default class AuthService {
  constructor() {
    this.currentUser = this.getUser();
    this.handleRefreshToken();
  }

  async login(email, password) {
    const postData = this.prepareLoginData(email, password);
    try {
      const result = await this.authenticatePost(postData);
      if (result.data.loggedTo) {
        if (result.data.loggedTo === 'guesty') {
          this.setUserToken(result.data.token);
          this.getUserData();

          return result.data.token;
        }

        this.setUserToken(result.data.access_token);
        this.setPordalConfig(result.data);

        await this.getPordalOwnerDetails();

        return result.data.access_token;
      }
    } catch (error) {
      throw new Error('Username does not exist or password is incorrect');
    }
  }

  async getPordalOwnerDetails() {
    const result = await Axios.get(`${environment.pordalApi}/owner-profile`);
    if (result.data) {
      this.setUser({
        ...result.data,
        userId: result.data.id,
        name: result.data.email,
        fullName: `${result.data.firstName} ${result.data.lastName}`,
        isPordalUser: true,
      });
    }
  }

  setPordalConfig(data) {
    const config = {
      ...data,
      expires_at: new Date().getTime() + data.expires_in * 1000,
    };
    localStorage.setItem(PORDAL_TOKEN_CONFIG, JSON.stringify(config));
  }

  handleRefreshToken() {
    const tokenConfigRaw = localStorage.getItem(PORDAL_TOKEN_CONFIG);
    if (!tokenConfigRaw) {
      return;
    }
    const tokenConfig = JSON.parse(tokenConfigRaw);
    const expirationTime = tokenConfig.expires_at - 1000 * 60;
    const currentTime = new Date().getTime();

    if (expirationTime < currentTime) {
      this.logoutProceed();
    } else {
      const timeout = setTimeout(async () => {
        const result = await this.refreshToken(tokenConfig.refresh_token);
        if (result.data) {
          this.setPordalConfig({ ...result.data, refresh_token: tokenConfig.refresh_token });
          this.handleRefreshToken();
        }
        clearTimeout(timeout);
      }, expirationTime - currentTime);
    }
  }

  async refreshToken(refreshToken) {
    return Axios.post(`${environment.pordalApi}/oauth`, {
      grant_type: 'refresh_token',
      client_id: environment.pordalAppClient,
      refresh_token: refreshToken,
    });
  }

  async authorizeAdmin(token) {
    const data = `token=${token}`;

    try {
      const { data: response } = await Axios.post(`${environment.ownerApi}/login_as_admin`, data);

      if (!response.accepted) {
        throw new Error('An error occured');
      }
      const userData = {
        ...response.owner_data,
        userId: response.owner_data.id || response.owner_data.pordal_id,
        name: response.owner_data.email,
        fullName: response.owner_data.full_name,
      };

      this.setAdminToken(token);
      this.setUser(userData);

      return userData;
    } catch (error) {
      authService.logoutProceed();

      throw new Error(error);
    }
  }

  setAdminToken(token) {
    localStorage.setItem(ADMIN_TOKEN_NAME, token);
  }

  setBearerToken(tokenData) {
    localStorage.setItem(ADMIN_ACCESS_TOKEN_NAME, tokenData);
  }

  parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        // eslint-disable-next-line prefer-template
        .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join('')
    );

    return JSON.parse(jsonPayload);
  }

  getUserData() {
    const token = this.getUserToken();
    this.setUser(this.parseJwt(token));
  }

  changePassword(email, oldPassword, newPassword) {
    const postData = this.prepareChangePasswordData(email, oldPassword, newPassword);

    return new Promise((resolve, reject) =>
      this.changePasswordPost(postData)
        .then((response) => {
          this.setUserToken(response.data.token);
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        })
    );
  }

  resetPassword(email) {
    const formData = new FormData();
    formData.append('email', email);

    return new Promise((resolve, reject) =>
      this.resetPasswordPost(formData)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        })
    );
  }

  setNewPassword(newPassword, confirmNewPassword, token) {
    const formData = new FormData();
    formData.append('txtpassword', newPassword);
    formData.append('txtNewPassword', confirmNewPassword);
    formData.append('password_link', token);

    return new Promise((resolve, reject) =>
      this.setNewPasswordPost(formData, token)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        })
    );
  }

  isLoggedIn() {
    return (
      (this.getUserToken() != null && this.currentUser != null) ||
      (this.getAdminToken() !== null && this.currentUser != null)
    );
  }

  logout() {
    const postData = {
      apiKey: environment.apiKey,
      accountId: environment.accountId,
    };

    return new Promise((resolve, reject) => {
      if (this.getUserToken()) {
        return this.logoutPost(postData)
          .then((response) => {
            this.logoutProceed();
            resolve(response);
          })
          .catch((error) => {
            this.logoutProceed();
            reject(error);
          });
      }

      this.logoutProceed();
      resolve();
    });
  }

  logoutProceed() {
    localStorage.removeItem(USER_TOKEN_NAME);
    localStorage.removeItem(USER_SESSION);
    localStorage.removeItem(ADMIN_TOKEN_NAME);
    localStorage.removeItem(PORDAL_TOKEN_CONFIG);
  }

  getUser() {
    const jsonUser = localStorage.getItem(USER_SESSION);
    if (jsonUser) {
      return JSON.parse(jsonUser);
    }

    return null;
  }

  setUser(user) {
    localStorage.setItem(USER_SESSION, JSON.stringify(user));
    this.currentUser = user;
  }

  getUserToken() {
    return localStorage.getItem(USER_TOKEN_NAME);
  }

  getAdminToken() {
    return localStorage.getItem(ADMIN_TOKEN_NAME);
  }

  setUserToken(token) {
    localStorage.setItem(USER_TOKEN_NAME, token);
  }

  prepareLoginData(email, password) {
    return {
      accountId: environment.accountId,
      username: email,
      password,
      apiKey: environment.apiKey,
    };
  }

  prepareChangePasswordData(email, oldPassword, newPassword) {
    return {
      accountId: environment.accountId,
      username: email,
      password: oldPassword,
      newPassword,
      apiKey: environment.apiKey,
    };
  }

  getBasicAuth(email, password) {
    return `Basic ${Buffer.from(`${email}:${password}`).toString('base64')}`;
  }

  authenticatePost(data) {
    return Axios.post(`${environment.ownerApi}/login`, data);
  }

  resetPasswordPost(data) {
    return Axios.post(`${environment.frankPorterApi}/owner_forgot_password`, data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }

  setNewPasswordPost(data, token) {
    return Axios.post(`${environment.frankPorterApi}/owner_reset_password/${token}`, data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }

  changePasswordPost(data) {
    return Axios.post(`${environment.guestyApi2}/authenticate/password/change`, data);
  }

  logoutPost(data) {
    return Axios.post(`${environment.guestyApi}/authenticate/revoke`, data);
  }
}

export const authService = new AuthService();
