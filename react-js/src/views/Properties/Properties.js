import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { authService } from 'services/authService';
import { LoaderContext } from 'components/common/Loader/Loader';
import environment from 'environments/environment';
import { getProperties } from 'services/propertyService';
import { getSurvey } from 'services/surveyService';
import Navigation from 'views/_PrivateLayout/Navigation';
import ThankYouPage from '../Account/EditProfile/ThankYouPage/ThankYouPage';
import './Properties.scss';
import PropertyItem from './PropertyItem';
import WelcomePage from './WelcomePage/WelcomePage';

export class Properties extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      properties: [],
      totalPages: 1,
      currentPage: 1,
      isRussian: false,
      initializeProfile:
        new URLSearchParams(this.props.location.search).get('initialize') === 'true',
      loading: true,
    };
    this.props.setPageTitle(this.props.t('common:properties'));
    this.props.setHomeVisibility(false);
    this.getData();
  }

  componentDidMount() {
    document.addEventListener('backbutton', this.backClick);
  }

  componentWillUnmount() {
    document.removeEventListener('backbutton', this.backClick);
  }

  onPageClick(page) {
    this.setState({ currentPage: page }, () => {
      this.getData();
    });
  }

  onPropertyClick(property) {
    this.props.history.push(`/calendar/${property.property_id}`);
  }

  backClick = () => {
    if (navigator.app) {
      navigator.app.exitApp();
    }
  };

  getData = () => {
    const { setLoaderVisibility } = this.context;
    setLoaderVisibility(true);
    Promise.all([
      getProperties(authService.currentUser.userId, this.state.currentPage),
      getSurvey({
        ownerId: authService.currentUser.userId,
      }),
    ])
      .then(([{ properties, totalProperties }, survey]) => {
        this.setState(
          {
            properties,
            totalPages: Math.ceil((totalProperties || properties.length) / environment.pageSize),
            initializeProfile: !survey?.surveyData?.isCompleted,
            isRussian: survey?.surveyData?.isRussian,
            loading: false,
          },
          () => {
            if (this.state.initializeProfile && !this.state.properties?.length) {
              this.props.history.push('/properties?initialize=true');
              this.props.setPageTitle(this.props.t('form:onboardingFrom'));
            }

            this.props.setIsSearchbarVisible(this.state.properties?.length > 0);
          }
        );
        setLoaderVisibility(false);
      })
      .catch(() => {
        setLoaderVisibility(false);
        this.setState({ loading: false });
      });
  };

  orderByNickname(prevValue, nextValue) {
    return prevValue.nickname.localeCompare(nextValue.nickname);
  }

  renderPagination() {
    if (this.state.totalPages <= 1) {
      return;
    }
    const pages = [];
    for (let i = 1; i <= this.state.totalPages; i++) {
      pages.push(
        <li
          className={`page${this.state.currentPage === i ? ' selected' : ''}`}
          onClick={this.onPageClick.bind(this, i)}
          key={i}
        >
          {i}
        </li>
      );
    }

    return <ul className="pagination">{pages}</ul>;
  }

  render() {
    return (
      <div className="container properties-container">
        {!this.state.loading ? (
          this.state.initializeProfile && !this.state.properties?.length ? (
            <WelcomePage isRussian={this.state.isRussian} />
          ) : this.state.properties?.length ? (
            <>
              {this.state.properties
                .filter(
                  (property) =>
                    property.nickname?.toLowerCase()?.includes(this.props.searchValue) ||
                    property.address?.toLowerCase()?.includes(this.props.searchValue) ||
                    property.address_2?.toLowerCase()?.includes(this.props.searchValue)
                )
                .sort((prevValue, nextValue) => this.orderByNickname(prevValue, nextValue))
                .map((property) => (
                  <PropertyItem
                    {...this.props}
                    key={property.nickname}
                    property={property}
                    onPropertyClick={this.onPropertyClick.bind(this)}
                  />
                ))}
              {this.renderPagination()}
            </>
          ) : (
            <ThankYouPage />
          )
        ) : null}
        <Navigation propertyId={this.state.propertyId} />
      </div>
    );
  }
}

export default withTranslation('properties')(Properties);

Properties.contextType = LoaderContext;
