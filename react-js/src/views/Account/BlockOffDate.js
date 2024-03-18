import moment from 'moment';
import React, { Component } from 'react';
import { isPordalProperty } from 'helpers/propertyHelper';
import { calendarService } from '../../services/calendarService';
import { LoaderContext } from '../../components/common/Loader/Loader';
import '../Calendar/Calendar.scss';
import CalendarTable from '../Calendar/CalendarTable';
import './Account.scss';
import { BlockOffDateForm } from './BlockOffDateForm';

export class BlockOffDate extends Component {
  constructor(props, context) {
    super(props, context);
    this.props.setPageTitle(this.props.t('blockOffDate'));
    this.state = {
      dateObject: moment(),
      propertyId: props.match.params.propertyId,
      reservations: [],
      blockOffDateForm: false,
      selectedDate: null,
      selectedReservation: null,
    };
    this.getReservations();
  }

  componentDidMount() {
    this.props.onRef(this);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.dateObject === prevState.dateObject) {
      return;
    }
    this.getReservations();
  }

  componentWillUnmount() {
    this.props.onRef(undefined);
  }

  getReservations() {
    const { setLoaderVisibility } = this.context;
    setLoaderVisibility(true);
    const currentDate = this.state.dateObject;
    const startOfCalendar = currentDate.startOf('month').format('YYYY-MM-DD');
    const endOfCalendar = currentDate.endOf('month').format('YYYY-MM-DD');

    const promises = [];
    promises.push(
      calendarService.getReservations(this.state.propertyId, startOfCalendar, endOfCalendar, true)
    );
    promises.push(
      calendarService.getBlockedDays(
        this.state.propertyId,
        startOfCalendar,
        endOfCalendar,
        this.props.t('ownerBlocked'),
        true
      )
    );
    if (isPordalProperty(this.state.propertyId)) {
      promises.push(
        calendarService.getOwnerPordalReservations(
          this.props.t('ownerBlocked'),
          this.state.propertyId,
          currentDate.startOf('month').format('YYYY-MM')
        )
      );
    }
    Promise.all(promises)
      .then(([reservations, ownerBooked, ownerReservationsPordal]) => {
        let ownerReservations = [...reservations, ...ownerBooked];
        if (ownerReservationsPordal?.success) {
          const reservationsTemp = ownerReservations.filter((x) =>
            ownerReservationsPordal.items.every(({ id }) => id !== x.id)
          );
          ownerReservations = [...ownerReservationsPordal.items, ...reservationsTemp];
        }
        this.setState({
          reservations: ownerReservations,
        });
      })
      .catch(() => setLoaderVisibility(false))
      .then(() => setLoaderVisibility(false));
  }

  changeDate(quantity, unit) {
    const newDateObject = this.state.dateObject.clone();
    newDateObject.add(quantity, unit);

    return new Promise((resolve) => {
      this.setState(
        {
          dateObject: newDateObject,
        },
        () => {
          resolve();
        }
      );
    });
  }

  checkIfCanBlock(date) {
    return (
      date.getTime() >= new Date().getTime() &&
      !this.state.reservations.some(
        (reservation) =>
          new Date(reservation.start).getTime() <= date.getTime() &&
          new Date(reservation.end).getTime() >= date.getTime()
      )
    );
  }

  shouldPushGap(checkInDate, lastCheckOut) {
    return checkInDate.getTime() - lastCheckOut.getTime() > 0;
  }

  dateClick(date) {
    date.setHours(15);
    if (this.checkIfCanBlock(date)) {
      this.setState({
        blockOffDateForm: true,
        selectedDate: date,
      });
    }
  }

  closeSelector() {
    this.setState({
      blockOffDateForm: false,
      selectedDate: null,
      selectedReservation: null,
    });
    this.getReservations();
  }

  editReservation(reservation) {
    if (reservation._def.extendedProps.ownerReservation) {
      this.setState((prevState) => ({
        blockOffDateForm: true,
        selectedDate: prevState.dateObject.toDate(),
        selectedReservation: reservation._def.publicId,
      }));
    }
  }

  render() {
    return (
      <div className="block-off-date account-overflow property-overflow">
        {this.state.blockOffDateForm ? (
          <BlockOffDateForm
            {...this.props}
            closeSelector={this.closeSelector.bind(this)}
            selectedDate={this.state.selectedDate}
            selectedReservation={this.state.selectedReservation}
            reservations={this.state.reservations}
          />
        ) : null}
        <CalendarTable
          {...this.props}
          changeCalendarDate={this.changeDate.bind(this)}
          dateClick={this.dateClick.bind(this)}
          dateObject={this.state.dateObject}
          reservations={this.state.reservations}
          showReservationDetails={() => {}}
          setSelectedReservation={this.editReservation.bind(this)}
        />
      </div>
    );
  }
}
export default BlockOffDate;

BlockOffDate.contextType = LoaderContext;
