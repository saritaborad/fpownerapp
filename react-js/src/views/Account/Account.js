import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { Route, Switch } from 'react-router-dom';
import { authService } from '../../services/authService';
import { LoaderContext } from '../../components/common/Loader/Loader';
import Navigation from '../_PrivateLayout/Navigation';
import './Account.scss';
import BlockOffDate from './BlockOffDate';
import ChangePassword from './ChangePassword';
import EditProfile from './EditProfile';
import PropertySummary from './PropertySummary';

export class Account extends Component {
  constructor(props) {
    super(props);

    this.state = {
      propertyId: props.match.params.propertyId,
      changePassword: false,
      blockOffDate: false,
    };
    this.props.setBackVisibility(false);
    this.props.setPageTitle(this.props.t('common:settings'));
  }

  componentDidMount() {
    this.props.onRef(this);
    document.addEventListener('backbutton', this.backClick);
  }

  componentWillUnmount() {
    this.props.onRef(undefined);
    document.removeEventListener('backbutton', this.backClick);
  }

  onLogoutClick() {
    const { setLoaderVisibility } = this.context;
    setLoaderVisibility(true);
    authService
      .logout()
      .then(() => {
        window.location.reload();
      })
      .catch(() => {
        window.location.reload();
        setLoaderVisibility(false);
      })
      .then(() => {
        setLoaderVisibility(false);
      });
  }

  onEditProfilePersonalClick() {
    this.props.history.push(`/settings/personal-survey/${this.state.propertyId || ''}`);
    this.props.setPageTitle(this.props.t('editProfile'));
    this.props.setBackVisibility(true);
  }

  onEditProfilePropertyClick() {
    this.props.history.push(`/settings/summary/${this.state.propertyId || ''}`);
    this.props.setPageTitle(this.props.t('changePropertyInfo'));
    this.props.setBackVisibility(true);
  }

  onAddProfilePropertyClick() {
    this.props.history.push(`/settings/add-property-survey/${this.state.propertyId || ''}`);
    this.props.setPageTitle(this.props.t('addInfoAboutNewProperty'));
    this.props.setBackVisibility(true);
  }

  onBlockOffDateClick() {
    this.setState({
      blockOffDate: true,
    });
    this.props.setPageTitle(this.props.t('blockOffDate'));
    this.props.setBackVisibility(true);
  }

  onChangePasswordClick() {
    this.setState({
      changePassword: true,
    });
    this.props.setPageTitle(this.props.t('changePassword'));
    this.props.setBackVisibility(true);
  }

  backClick = () => {
    if (this.blockOffDateRef || this.state.changePassword || this.state.blockOffDate) {
      this.goBack();
    } else {
      this.props.history.push(`/settings/list/${this.state.propertyId || ''}`);
    }
  };

  goBack() {
    if (this.blockOffDateRef && this.blockOffDateRef.state.blockOffDateForm) {
      this.blockOffDateRef.setState({
        blockOffDateForm: false,
        selectedReservation: null,
      });
      this.props.setBackVisibility(true);
    } else {
      this.setState({
        changePassword: false,
        blockOffDate: false,
      });
      this.props.setPageTitle(this.props.t('common:settings'));
      this.props.setBackVisibility(false);
    }
  }

  render() {
    const { t } = this.props;

    return (
      <div className="container account-container">
        <Switch>
          <Route
            path="/settings/summary/:propertyId?"
            name="Home"
            render={(props) => (
              <PropertySummary {...props} setBackVisibility={this.props.setBackVisibility} />
            )}
          />
          <Route
            path="/settings/personal-survey/:propertyId?"
            name="Home"
            render={(props) => (
              <EditProfile
                personalDetails
                setBackVisibility={this.props.setBackVisibility}
                {...props}
              />
            )}
          />
          <Route
            path="/settings/property-survey/:propertyId?/:step?"
            name="Home"
            render={(props) => (
              <EditProfile
                propertyDetails
                setBackVisibility={this.props.setBackVisibility}
                {...props}
              />
            )}
          />
          <Route
            path="/settings/add-property-survey/:propertyId?"
            name="Home"
            render={(props) => (
              <EditProfile
                propertyDetails
                setBackVisibility={this.props.setBackVisibility}
                {...props}
              />
            )}
          />
          <Route
            path="/settings/initialize"
            name="Home"
            render={(props) => (
              <EditProfile
                initializeProfile
                setBackVisibility={this.props.setBackVisibility}
                setPageTitle={this.props.setPageTitle}
                {...props}
              />
            )}
          />
          {this.state.changePassword ? <ChangePassword {...this.props} /> : null}
          {this.state.blockOffDate && this.state.propertyId ? (
            <BlockOffDate
              {...this.props}
              propertyId={this.state.propertyId}
              onRef={(ref) => {
                this.blockOffDateRef = ref;
              }}
            />
          ) : null}
          <ul className="account-items">
            {this.state.propertyId && (
              <li onClick={this.onBlockOffDateClick.bind(this)}>
                <div className="item-name">{t('blockOffDate')}</div>
                <div className="column-arrow">
                  <i className="icon icon-arrow" />
                </div>
              </li>
            )}
            <li onClick={this.onChangePasswordClick.bind(this)}>
              <div className="item-name">{t('changePassword')}</div>
              <div className="column-arrow">
                <i className="icon icon-arrow" />
              </div>
            </li>
            <li onClick={this.onEditProfilePersonalClick.bind(this)}>
              <div className="item-name">{t('editProfile')}</div>
              <div className="column-arrow">
                <i className="icon icon-arrow" />
              </div>
            </li>
            {this.state.propertyId && (
              <li onClick={this.onEditProfilePropertyClick.bind(this)}>
                <div className="item-name">{t('changePropertyInfo')}</div>
                <div className="column-arrow">
                  <i className="icon icon-arrow" />
                </div>
              </li>
            )}
            <li onClick={this.onLogoutClick.bind(this)}>
              <div className="item-name">{t('logout')}</div>

              <div className="column-arrow">
                <i className="icon icon-arrow" />
              </div>
            </li>
          </ul>
        </Switch>
        <Navigation selected="settings" propertyId={this.state.propertyId} />
      </div>
    );
  }
}

export default withTranslation('user')(Account);

Account.contextType = LoaderContext;
