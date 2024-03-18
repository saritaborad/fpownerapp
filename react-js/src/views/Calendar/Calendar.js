import moment from 'moment';
import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import swal from 'sweetalert';
import { calendarService } from '../../services/calendarService';
import { getCommission } from '../../services/commissionService';
import { LoaderContext } from '../../components/common/Loader/Loader';
import { getPropertyCurrency } from '../../services/propertyService';
import Navigation from '../_PrivateLayout/Navigation';
import './Calendar.scss';
import CalendarTable from './CalendarTable';
import OccupancyRate from './OccupancyRate/OccupancyRate';
import ReservationDetails from './ReservationDetails';
import SmallCalendar from './SmallCalendar/SmallCalendar';
import Statistics from './Statistics';

class Calendar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dateObject: moment(),
      propertyId: props.match.params.propertyId,
      reservations: [],
      selectedReservation: null,
      reservationDetailsVisible: false,
      currency: null,
      commisionValue: 1,
    };
    this.changeDate = this.changeDate.bind(this);
    this.getReservations = this.getReservations.bind(this);
    this.showReservationDetails = this.showReservationDetails.bind(this);
    this.onPropertyChangeHandler = this.onPropertyChangeHandler.bind(this);
    this.setSelectedReservation = this.setSelectedReservation.bind(this);
    this.props.setPageTitle(this.props.t('common:calendar'));
    this.props.setBackVisibility(false);
  }

  componentDidMount() {
    document.addEventListener('backbutton', this.backClick);
    this.props.onRef(this);
    this.getReservations();
    this.getPropertyBasicData();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      this.state.dateObject === prevState.dateObject &&
      this.state.propertyId === prevState.propertyId
    ) {
      return;
    }
    this.getReservations();
  }

  componentWillUnmount() {
    document.removeEventListener('backbutton', this.backClick);
    this.props.onRef(undefined);
  }

  onPropertyChangeHandler(propertyId) {
    this.setState({
      propertyId,
    });
  }

  getPropertyBasicData() {
    getPropertyCurrency(this.state.propertyId)
      .then((response) => {
        this.setState({ currency: response.currency });
      })
      .catch(() => {
        swal(this.props.t('properties:propertyNotFoundError')).then(() => {
          window.location.replace('/#/properties');
        });
      });
  }

  getReservations = () => {
    const { setLoaderVisibility } = this.context;
    setLoaderVisibility(true);

    const currentDate = moment(this.state.dateObject);
    const startOfCalendar = currentDate.startOf('month').format('YYYY-MM-DD');
    const endOfCalendar = currentDate.endOf('month').format('YYYY-MM-DD');
    const getReservationsPromise = calendarService.getReservations(
      this.state.propertyId,
      startOfCalendar,
      endOfCalendar
    );
    const getBlockedDaysPromise = calendarService.getBlockedDays(
      this.state.propertyId,
      startOfCalendar,
      endOfCalendar,
      this.props.t('ownerBlocked')
    );
    const getCommissionPromise = getCommission({
      propertyId: this.state.propertyId,
      month: currentDate.format('MM'),
      year: currentDate.year(),
    });
    Promise.all([getReservationsPromise, getBlockedDaysPromise, getCommissionPromise])
      .then(([reservations, ownerBooked, commission]) => {
        this.setState((prevState) => ({
          commisionValue: commission?.config_commission_fee
            ? parseFloat(commission.config_commission_fee.value)
            : prevState.commisionValue,
          reservations: [...reservations, ...ownerBooked],
        }));
      })
      .catch(() => {
        setLoaderVisibility(false);
      })
      .then(() => {
        setLoaderVisibility(false);
      });
  };

  getListWithMonth() {
    const months = [];
    const allMonths = moment.months();
    allMonths.map((data) =>
      months.push(
        <option key={data} value={data}>
          {`${data} `}
        </option>
      )
    );

    return months;
  }

  setSelectedReservation(reservation) {
    this.setState({
      selectedReservation: reservation,
    });
  }

  backClick = () => {
    if (this.state.reservationDetailsVisible) {
      this.goBack();
    } else {
      this.props.history.push(`/properties`);
    }
  };

  changeDate(quantity, unit) {
    const newDateObject = this.state.dateObject.clone();
    newDateObject.add(quantity, unit);

    return new Promise((resolve) => {
      this.setState({
        dateObject: newDateObject,
      });
      resolve();
    });
  }

  goBack() {
    this.setState({
      reservationDetailsVisible: false,
    });
    this.props.setPageTitle(this.props.t('common:calendar'));
    this.props.setBackVisibility(false);
  }

  showReservationDetails() {
    this.setState({
      reservationDetailsVisible: true,
    });
    this.props.setPageTitle(this.props.t('booking details'));
    this.props.setBackVisibility(true);
  }

  render() {
    const { t } = this.props;

    return (
      <div className="container calendar-container">
        <div className="row">
          <div className="col-lg-8">
            <div className="row">
              <div className="col-lg-12">
                <CalendarTable
                  {...this.props}
                  changeCalendarDate={this.changeDate}
                  dateObject={moment(this.state.dateObject)}
                  reservations={this.state.reservations}
                  selectedReservation={this.state.selectedReservation}
                  setSelectedReservation={this.setSelectedReservation}
                  showReservationDetails={this.showReservationDetails}
                />
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <ReservationDetails
              {...this.props}
              reservation={this.state.selectedReservation}
              visible={this.state.reservationDetailsVisible}
              currency={this.state.currency}
              commisionValue={this.state.commisionValue}
            />
          </div>
        </div>

        <div className="row">
          <div className="col-lg-12 only-desktop">
            <h1 className="container-heading mt-3">
              {t('futureOccupancy')}
              <span className="badge badge-pill badge-primary">{t('occupy')}</span>
              <span className="badge badge-pill badge-secondary">{t('available')}</span>
            </h1>
          </div>
          <div className="col-lg-6 col-xl-3">
            <SmallCalendar
              {...this.props}
              key={1}
              propertyId={this.state.propertyId}
              dateObject={moment(this.state.dateObject).add(1, 'month')}
            />
          </div>
          <div className="col-lg-6 col-xl-3">
            <SmallCalendar
              {...this.props}
              key={2}
              propertyId={this.state.propertyId}
              dateObject={moment(this.state.dateObject).add(2, 'month')}
            />
          </div>
          <div className="col-lg-6 col-xl-3">
            <SmallCalendar
              {...this.props}
              key={3}
              propertyId={this.state.propertyId}
              dateObject={moment(this.state.dateObject).add(3, 'month')}
            />
          </div>
          <div className="col-lg-6 col-xl-3">
            <Statistics
              {...this.props}
              monthName={this.state.dateObject.format('MMMM')}
              month={this.state.dateObject.format('MM')}
              year={this.state.dateObject.format('YYYY')}
              propertyId={this.state.propertyId}
              currency={this.state.currency}
            />
          </div>
        </div>
        <div className="row">
          <OccupancyRate
            {...this.props}
            propertyId={this.state.propertyId}
            dateObject={moment(this.state.dateObject)}
          />
        </div>

        <Navigation selected="calendar" propertyId={this.state.propertyId} />
      </div>
    );
  }
}

export default withTranslation('calendar')(Calendar);

Calendar.contextType = LoaderContext;
