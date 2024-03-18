import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { authService } from '../../services/authService';
import './AdminLogin.scss';

class AdminLogin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: props.match.params.token,
      error: false,
    };
  }

  componentDidMount() {
    authService.logoutProceed();
    authService
      .authorizeAdmin(this.state.token)
      .then(() => {
        this.props.history.push(`/properties`);
      })
      .catch(() => {
        this.setState({ error: true });
      });
  }

  render() {
    return (
      <div className="alert alert-success" role="alert">
        {this.state.error ? this.props.t('adminLoginError') : this.props.t('adminLoginPending')}
      </div>
    );
  }
}

export default withTranslation('common')(AdminLogin);
