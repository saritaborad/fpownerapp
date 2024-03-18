import Axios from 'axios';
import environment from '../environments/environment';

export default class UserService {
  getUserNotifications(userId) {
    return new Promise((resolve, reject) =>
      this.getUserNotificationsGet(userId)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        })
    );
  }

  markNotificationAsRead(userId, notificationId) {
    return new Promise((resolve, reject) =>
      this.markNotificationAsReadPost(userId, notificationId)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        })
    );
  }

  getUserNotificationsGet(userId) {
    return Axios.get(`${environment.ownerApi}/notifications?guesty_id=${userId}&limit=10`);
  }

  markNotificationAsReadPost(userId, notificationId) {
    return Axios.get(
      `${environment.ownerApi}/readnotification?id_notification=${notificationId}&guesty_id=${userId}`
    );
  }
}

export const userService = new UserService();
