import React, { Component, Suspense } from 'react';
import { withTranslation } from 'react-i18next';
import { Redirect, Route, Switch } from 'react-router-dom';
import Account from 'views/Account/Account';
import Calendar from 'views/Calendar/Calendar';
import Properties from 'views/Properties/Properties';
import Documents from 'views/Documents/Documents';
import MailForSupport from 'views/Help/MailForSupport/MailForSupport';
import Faq from 'views/Help/Faq';
import Help from 'views/Help/Help';
import Footer from './Footer';
import Header from './Header';
import './PrivateLayout.scss';
import Sidebar from './Sidebar';

class PrivateLayout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      goBackVisible: false,
      pageTitle: '',
      homeVisible: false,
      notificationVisible: true,
      isSearchbarVisible: false,
      searchValue: '',
    };

    this.routes = [
      {
        path: '/properties',
        component: Properties,
        name: this.props.t('propertiesMenu'),
        icon: 'ico-properties',
        propertyIdRequired: false,
      },
      {
        path: '/calendar',
        component: Calendar,
        name: this.props.t('calendar'),
        icon: 'ico-calendar',
        propertyIdRequired: true,
      },
      {
        path: '/documents/statements',
        component: Documents,
        name: this.props.t('statements'),
        icon: 'ico-statements',
        propertyIdRequired: true,
      },
      {
        path: '/documents/maintenance',
        component: Documents,
        name: this.props.t('maintenance'),
        icon: 'ico-statements',
        propertyIdRequired: true,
      },
      {
        path: '/settings/list',
        component: Account,
        name: this.props.t('settings'),
        icon: 'ico-settings',
        propertyIdRequired: false,
        customPathMatcher: '/settings',
      },
      {
        path: '/help',
        component: Help,
        name: this.props.t('help'),
        icon: 'icon-help',
        propertyIdRequired: false,
      },
    ];
  }

  setSearchValue(value) {
    this.setState({ searchValue: value });
  }

  setIsSearchbarVisible(value) {
    this.setState({ isSearchbarVisible: value });
  }

  setPageTitle(title) {
    this.setState({ pageTitle: title });
  }

  setNotificationsVisibility(visible) {
    this.setState({
      notificationVisible: visible,
    });
  }

  setHomeVisibility(visible) {
    this.setState({
      homeVisible: visible,
    });
  }

  setBackVisibility(visible) {
    this.setState({ goBackVisible: visible, homeVisible: !visible });
  }

  loading() {
    return <div className="animated fadeIn pt-1 text-center">Loading...</div>;
  }

  goBack() {
    this.setState({
      goBackVisible: false,
      homeVisible: true,
    });
    if (this.account) {
      this.account.backClick();
    } else if (this.statements) {
      this.statements.goBack();
    } else if (this.calendar) {
      this.calendar.goBack();
    } else {
      this.props.history.goBack();
    }
  }

  render() {
    return (
      <div>
        <Header
          t={this.props.t}
          history={this.props.history}
          goBack={this.goBack.bind(this)}
          pageTitle={this.state.pageTitle}
          searchValue={this.state.searchValue}
          setSearchValue={this.setSearchValue.bind(this)}
          isSearchbarVisible={this.state.isSearchbarVisible}
          homeVisible={this.state.homeVisible}
          goBackVisible={this.state.goBackVisible}
          settingsVisible={!this.state.homeVisible && !this.state.goBackVisible}
          notificationVisible={this.state.notificationVisible}
        />
        <Sidebar routes={this.routes} {...this.props} />
        <div className="main">
          <Suspense fallback={this.loading}>
            <Switch>
              <Route
                path="/properties"
                render={({ location, history }) => (
                  <Properties
                    t={this.props.t}
                    history={history}
                    location={location}
                    setPageTitle={this.setPageTitle.bind(this)}
                    setHomeVisibility={this.setHomeVisibility.bind(this)}
                    searchValue={this.state.searchValue}
                    setSearchValue={this.setSearchValue.bind(this)}
                    setIsSearchbarVisible={this.setIsSearchbarVisible.bind(this)}
                  />
                )}
              />
              <Route
                path="/documents/:action/:propertyId/:year?/:month?"
                render={(props) => (
                  <Documents
                    {...props}
                    setBackVisibility={this.setBackVisibility.bind(this)}
                    setNotificationsVisibility={this.setNotificationsVisibility.bind(this)}
                    setPageTitle={this.setPageTitle.bind(this)}
                    onRef={(ref) => {
                      this.statements = ref;
                    }}
                  />
                )}
              />
              <Route
                path="/calendar/:propertyId"
                render={(props) => (
                  <Calendar
                    {...props}
                    setPageTitle={this.setPageTitle.bind(this)}
                    setBackVisibility={this.setBackVisibility.bind(this)}
                    onRef={(ref) => {
                      this.calendar = ref;
                    }}
                  />
                )}
              />
              <Route
                path="/settings/:action/:propertyId?"
                render={(props) => (
                  <Account
                    onRef={(ref) => {
                      this.account = ref;
                    }}
                    setPageTitle={this.setPageTitle.bind(this)}
                    setBackVisibility={this.setBackVisibility.bind(this)}
                    {...props}
                  />
                )}
              />
              <Route
                path="/help/contact-support/:propertyId?"
                render={() => (
                  <MailForSupport
                    setPageTitle={this.setPageTitle.bind(this)}
                    setBackVisibility={this.setBackVisibility.bind(this)}
                  />
                )}
              />
              <Route
                path="/help/faq/:propertyId?"
                render={() => (
                  <Faq
                    setPageTitle={this.setPageTitle.bind(this)}
                    setBackVisibility={this.setBackVisibility.bind(this)}
                  />
                )}
              />
              <Route
                exact
                path="/help/:propertyId?"
                render={() => (
                  <Help
                    setPageTitle={this.setPageTitle.bind(this)}
                    setBackVisibility={this.setBackVisibility.bind(this)}
                  />
                )}
              />
              <Redirect from="/" to="/properties" />
            </Switch>
          </Suspense>
        </div>
        <Footer loading={this.loading} />
      </div>
    );
  }
}

export default withTranslation('common')(PrivateLayout);
