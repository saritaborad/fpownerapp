import React from 'react';
import { withTranslation } from 'react-i18next';
import { Redirect, Route, Switch } from 'react-router-dom';
import AdminLogin from '../AdminLogin/AdminLogin';
import Login from '../User/Login/Login';
import NewPassword from '../User/NewPassword/NewPassword';
import ResetPassword from '../User/ResetPassword/ResetPassword';
import logo from '../../assets/FP_Logo_with_slogan_White.png';
import './PublicLayout.scss';

function PublicLayout() {
  return (
    <div className="public-container">
      <div className="public-content">
        <img src={logo} alt="logo" className="fp-logo" />
        <div className="round-separator">
          <div className="circle" />
        </div>
        <div>
          <Switch>
            <Route path="/login" component={Login} />
            <Route path="/reset-password" component={ResetPassword} />
            <Route path="/new-password/:token" component={NewPassword} />
            <Route path="/admin-login/:token" component={AdminLogin} />
            <Redirect from="/" to="/login" />
          </Switch>
        </div>
      </div>
    </div>
  );
}

export default withTranslation('common')(PublicLayout);
