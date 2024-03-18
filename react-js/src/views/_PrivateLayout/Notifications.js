import React, { Component } from 'react';
import { authService } from '../../services/authService';
import { userService } from '../../services/userService';

export class Notifications extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showNotifications: false,
      notifications: [],
      openedNotification: null,
      modalIsOpen: false,
    };
    this.getNotifications();
  }

  onBellClick() {
    this.setState((prevState) => ({
      showNotifications: !prevState.showNotifications,
    }));
  }

  onNotificationClick(notification) {
    this.setState({
      showNotifications: false,
      modalIsOpen: true,
      openedNotification: notification,
    });
    if (notification.read_at) {
      return;
    }
    userService.markNotificationAsRead(authService.currentUser.userId, notification.id).then(() => {
      const newArr = this.state.notifications.slice();
      const foundNotification = newArr.find((x) => x.id === notification.id);
      if (foundNotification) {
        foundNotification.read_at = new Date();
        this.setState({ notifications: newArr });
      }
    });
  }

  onCloseModalClick() {
    this.setState({ modalIsOpen: false, openedNotification: null });
  }

  getNotifications() {
    userService.getUserNotifications(authService.currentUser.userId).then((notifications) => {
      if (notifications) {
        const notificationSorted = notifications.sort(
          (a, b) =>
            (a.read_at !== null) - (b.read_at !== null) ||
            new Date(b.created_at) - new Date(a.created_at)
        );
        this.setState({ notifications: notificationSorted });
      }
    });
  }

  unreadNotifications() {
    return this.state.notifications.filter((notification) => !notification.read_at);
  }

  render() {
    return (
      <div className="notifications">
        <div onClick={this.onBellClick.bind(this)}>
          <i className="icon-bell" />
          <div className="unread-notifications">{this.unreadNotifications().length}</div>
        </div>
        {this.state.showNotifications && (
          <div className="overlay" onClick={this.onBellClick.bind(this)} />
        )}
        <div
          className={`dropdown-menu dropdown-menu-right${
            this.state.showNotifications ? ' show' : ''
          }`}
        >
          <div className="text-center dropdown-header">
            <strong>
              {this.props.t('unreadMessages', {
                quantity: this.unreadNotifications().length,
              })}
            </strong>
          </div>
          {this.state.notifications.map((notification) => (
            <button
              key={notification.id}
              type="button"
              onClick={this.onNotificationClick.bind(this, notification)}
              className={`dropdown-item${notification.read_at ? '' : ' unread'}`}
            >
              {notification.content}
            </button>
          ))}
        </div>
        {this.state.modalIsOpen && this.state.openedNotification ? (
          <div>
            <div className="modal-overlay" />
            <div className="notification-modal">
              {this.state.openedNotification.content}
              <div className="button-container">
                <button onClick={this.onCloseModalClick.bind(this)} className="btn" type="button">
                  {this.props.t('close')}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  }
}
