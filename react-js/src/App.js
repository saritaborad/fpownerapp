import MomentUtils from '@date-io/moment';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { HashRouter, Route } from 'react-router-dom';
import './App.scss';
import './interceptors/pordalApiInterceptor';
import './interceptors/guestyApiInterceptor';
import './interceptors/ownerApiInterceptor';
import { authService } from './services/authService';
import LoaderProvider from './components/common/Loader/Loader';
import PrivateLayout from './views/_PrivateLayout/PrivateLayout';
import PublicLayout from './views/_PublicLayout/PublicLayout';

class App extends Component {
  constructor(props) {
    super(props);
    if (window.location.href.includes('admin-login')) {
      authService.logoutProceed();
    }
  }

  render() {
    return (
      <MuiPickersUtilsProvider utils={MomentUtils}>
        <HashRouter>
          <LoaderProvider>
            <Route
              path="/"
              name="Home"
              render={(props) =>
                authService.isLoggedIn() ? (
                  <PrivateLayout {...props} />
                ) : (
                  <PublicLayout {...props} />
                )
              }
            />
          </LoaderProvider>
        </HashRouter>
      </MuiPickersUtilsProvider>
    );
  }
}

export default withTranslation('common')(App);
