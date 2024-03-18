import { KeyboardTimePicker } from '@material-ui/pickers';
import moment from 'moment';
import React, { Component } from 'react';
import SimpleReactValidator from 'simple-react-validator';
import swal from 'sweetalert';
import environment from '../../environments/environment';
import { authService } from '../../services/authService';
import { calendarService } from '../../services/calendarService';
import { LoaderContext } from '../../components/common/Loader/Loader';
import { getPropertyBasicInfo } from '../../services/propertyService';
import { sendEmail } from '../../services/emailService';
import '../Calendar/Calendar.scss';
import './Account.scss';

export class BlockOffDateForm extends Component {
  constructor(props, context) {
    super(props, context);
    this.initializeValidator();
    this.props.setPageTitle(this.props.t('blockOffDate'));
    this.minFromTime = '15:00';
    this.maxToTime = '11:00';
    this.originalToDate = moment(this.props.selectedDate).add(1, 'days').format('YYYY-MM-DD');
    this.state = {
      propertyId: props.match.params.propertyId,
      fromDate: moment(this.props.selectedDate).format('YYYY-MM-DD'),
      fromTime: moment(this.minFromTime, environment.timeFormatRU),
      toDate: moment(this.props.selectedDate).add(1, 'days').format('YYYY-MM-DD'),
      toTime: moment(this.maxToTime, environment.timeFormatRU),
      accessCard: '',
      note: '',
      errorMessage: '',
      reservations: this.props.reservations,
    };
    this.minDate = moment().format('YYYY-MM-DD');
    this.getProperty();
    this.accessCardValues = [
      'accessCardQuestionRequireBoth',
      'accessCardQuestionRequireKeys',
      'accessCardQuestionRequireCard',
      'accessCardQuestionRequireNone',
    ];
  }

  componentDidMount() {
    if (this.props.selectedReservation) {
      this.setEditMode();
    }
  }

  onSendClick(event) {
    event.preventDefault();
    this.clearErrorMessages();
    if (this.validator.allValid()) {
      const blockOffDataPromise = this.convertAndValidate();
      blockOffDataPromise.then((blockOffData) => {
        if (blockOffData.valid) {
          if (this.props.selectedReservation) {
            this.updateBlockOffDate(blockOffData);
          } else {
            this.blockOffDate(blockOffData);
          }
        } else {
          this.showMessagesAndUpdate(blockOffData);
        }
      });
    } else {
      this.showMessagesAndUpdate();
    }
  }

  async onCancelReservationClick() {
    const { setLoaderVisibility } = this.context;
    setLoaderVisibility(true);

    if (authService.currentUser.isPordalUser) {
      const unblockDateResult = await calendarService.unblockDatePordal(
        this.props.selectedReservation
      );

      if (unblockDateResult.success) {
        this.sendEmailFunc(this.props.t('ownerBlockedDateRemoved'));
      } else {
        this.setState({
          errorMessage: unblockDateResult.message || this.props.t('errorWhileBlocking'),
        });
        setLoaderVisibility(false);
      }
    } else {
      calendarService
        .unblockDate(this.props.selectedReservation)
        .then(() => {
          this.sendEmailFunc(this.props.t('ownerBlockedDateRemoved'));
        })
        .catch((error) => {
          this.setState({
            errorMessage: error,
          });
          setLoaderVisibility(false);
        });
    }
  }

  onChangeHandler = (event) => {
    this.setState({
      [event.target.name]: event.target.value,
    });
  };

  onTimeFromChange(options) {
    this.setState({
      fromTime: options,
    });
  }

  onTimeToChange(options) {
    this.setState({
      toTime: options,
    });
  }

  setEditMode() {
    const reservation = this.state.reservations.find(
      (res) => res.id === this.props.selectedReservation
    );
    if (reservation) {
      const fromDateTime = moment(reservation.start);
      const toDateTime = moment(reservation.end);
      this.setState({
        fromDate: fromDateTime.format('YYYY-MM-DD'),
        fromTime: fromDateTime,
        toDate: toDateTime.format('YYYY-MM-DD'),
        toTime: toDateTime,
        note: reservation.note,
      });
    }
  }

  getProperty() {
    const { setLoaderVisibility } = this.context;
    setLoaderVisibility(true);
    getPropertyBasicInfo(this.props.propertyId)
      .then(({ title, nickname }) => {
        this.setState({ propertyName: title, nickname });
        setLoaderVisibility(false);
      })
      .catch(() => {
        setLoaderVisibility(false);
        swal(this.props.t('properties:propertyNotFoundError')).then(() => {
          window.location.replace('/#/properties');
        });
      });
  }

  getBlockModel(valid, message, fromDateTime, toDateTime) {
    return {
      valid,
      message,
      propertyId: this.state.propertyId,
      note: this.state.note,
      fromDateTime,
      toDateTime,
    };
  }

  getReservations(fromDateTime, toDateTime) {
    const startOfCalendar = moment(fromDateTime).format('YYYY-MM-DD');
    const endOfCalendar = moment(toDateTime).format('YYYY-MM-DD');

    const getReservationsPromise = calendarService.getReservations(
      this.state.propertyId,
      startOfCalendar,
      endOfCalendar,
      true
    );
    const getBlockedDaysPromise = calendarService.getBlockedDays(
      this.state.propertyId,
      startOfCalendar,
      endOfCalendar,
      null,
      true
    );

    return Promise.all([getReservationsPromise, getBlockedDaysPromise]);
  }

  shouldGetOtherMonths(fromDateTime, toDateTime) {
    return (
      fromDateTime.getMonth() !== this.props.selectedDate.getMonth() ||
      toDateTime.getMonth() !== this.props.selectedDate.getMonth() ||
      this.props.selectedDate.getFullYear() !== fromDateTime.getFullYear() ||
      this.props.selectedDate.getFullYear() !== toDateTime.getFullYear()
    );
  }

  checkIfDateTimeInFreeTime(reservations, fromDateTime, toDateTime) {
    if (!this.dateTimeInFreeTime(reservations, fromDateTime, toDateTime)) {
      return {
        valid: false,
        message: this.props.t('dateSelectionShouldBeInFreeTime'),
      };
    }

    return {
      valid: true,
    };
  }

  convertAndValidate() {
    const setNextDay = this.shouldExtendReservation();

    const fromDateTime = moment(
      `${this.state.fromDate} ${this.state.fromTime.format(environment.timeFormat)}`,
      'YYYY-MM-DD hh:mm A'
    ).toDate();
    this.originalToDate = this.generateToDate(
      this.state.toDate,
      moment(this.maxToTime, environment.timeFormat),
      this.state.toTime,
      false
    );
    const toDateTime = this.generateToDate(
      this.state.toDate,
      moment(this.maxToTime, environment.timeFormat),
      this.state.toTime,
      setNextDay
    );

    return new Promise((resolve, reject) => {
      if (!this.toDateTimeIsBiggerThanFrom(fromDateTime, toDateTime)) {
        resolve(
          this.getBlockModel(
            false,
            this.props.t('toDatetimeCannotBeBiggerThanFromDatetime'),
            fromDateTime,
            toDateTime
          )
        );

        return;
      }
      if (!this.shouldGetOtherMonths(fromDateTime, toDateTime)) {
        const { valid, message } = this.checkIfDateTimeInFreeTime(
          this.state.reservations,
          fromDateTime,
          toDateTime
        );
        resolve(this.getBlockModel(valid, message, fromDateTime, toDateTime));

        return;
      }
      this.getReservations(fromDateTime, toDateTime)
        .then(([reservations, ownerBooked]) => {
          const allReservations = [...reservations, ...ownerBooked];
          const { valid, message } = this.checkIfDateTimeInFreeTime(
            allReservations,
            fromDateTime,
            toDateTime
          );
          resolve(this.getBlockModel(valid, message, fromDateTime, toDateTime));
        })
        .catch(() => {
          reject();
        });
    });
  }

  shouldExtendReservation() {
    return (
      this.state.toTime &&
      moment(this.maxToTime, environment.timeFormat).isBefore(
        moment(this.state.toTime.format(environment.timeFormat), environment.timeFormat)
      )
    );
  }

  generateToDate(toDate, maxToTime, toTime, setNextDay) {
    return moment(
      `${toDate} ${moment(setNextDay ? maxToTime : toTime).format(environment.timeFormat)}`,
      'YYYY-MM-DD hh:mm A'
    )
      .add(setNextDay ? 1 : 0, 'day')
      .toDate();
  }

  clearErrorMessages() {
    this.setState({ errorMessage: '' });
  }

  async sendEmailFunc(text, create = false) {
    const { setLoaderVisibility } = this.context;
    const user = authService.currentUser;
    const subject = `${this.state.nickname} - ${this.state.propertyName} - ${text}`;
    let body = `${this.props.t('from')}: ${this.state.fromDate} ${moment(
      this.state.fromTime
    ).format(environment.timeFormat)} <br />`;
    body += `${this.props.t('to')}: ${this.state.toDate} ${this.state.toTime.format(
      environment.timeFormat
    )} <br />`;
    if (create) {
      body += `${this.props.t('accessCardQuestion')}: ${this.props.t(
        this.state.accessCard
      )} <br />`;
    }
    body += `${this.props.t('note')}: ${this.state.note} <br />`;
    try {
      await sendEmail(user, subject, body);
    } catch (err) {
      console.error(err);
    }
    this.props.closeSelector();
    setLoaderVisibility(false);
  }

  initializeValidator() {
    this.validator = new SimpleReactValidator({
      className: 'invalid-field',
      validators: {
        timeBiggerOrEqual: {
          rule: (val, [minDate, minTime]) => {
            const minDateTime = moment(
              `${minDate} ${moment(minTime, environment.timeFormat).format(
                environment.timeFormat
              )}`,
              'YYYY-MM-DD hh:mm A'
            );
            const currentDateTime = moment(
              `${minDate} ${moment(val).format(environment.timeFormat)}`,
              'YYYY-MM-DD hh:mm A'
            );

            return currentDateTime.isSameOrAfter(minDateTime);
          },
        },

        timeLessOrEqual: {
          rule: (val, [maxDate, maxTime]) => {
            const maxDateTime = moment(
              `${maxDate} ${moment(maxTime, environment.timeFormat).format(
                environment.timeFormat
              )}`,
              'YYYY-MM-DD hh:mm A'
            );
            const currentDateTime = moment(
              `${maxDate} ${moment(val).format(environment.timeFormat)}`,
              'YYYY-MM-DD hh:mm A'
            );

            return currentDateTime.isSameOrBefore(maxDateTime);
          },
        },
      },
    });
  }

  dateTimeInFreeTime(reservations, fromDateTime, toDateTime) {
    return !reservations.some(
      (reservation) =>
        (this.reservationIncludesDates(reservation, fromDateTime, toDateTime) &&
          this.isDifferentReservation(reservation)) ||
        (this.datesIncludesReservation(reservation, fromDateTime, toDateTime) &&
          this.isDifferentReservation(reservation))
    );
  }

  isDifferentReservation(reservation) {
    return this.props.selectedReservation
      ? this.props.selectedReservation !== reservation.id
      : true;
  }

  datesIncludesReservation(reservation, fromDateTime, toDateTime) {
    return (
      (new Date(reservation.start).getTime() >= fromDateTime.getTime() &&
        new Date(reservation.start).getTime() <= toDateTime.getTime()) ||
      (new Date(reservation.end).getTime() >= fromDateTime.getTime() &&
        new Date(reservation.end).getTime() <= toDateTime.getTime())
    );
  }

  reservationIncludesDates(reservation, fromDateTime, toDateTime) {
    return (
      (new Date(reservation.start).getTime() <= fromDateTime.getTime() &&
        new Date(reservation.end).getTime() >= fromDateTime.getTime()) ||
      (new Date(reservation.start).getTime() <= toDateTime.getTime() &&
        new Date(reservation.end).getTime() >= toDateTime.getTime())
    );
  }

  toDateTimeIsBiggerThanFrom(fromDateTime, toDateTime) {
    return toDateTime.getTime() - fromDateTime.getTime() > 0;
  }

  async updateBlockOffDate(blockOffData) {
    const { setLoaderVisibility } = this.context;
    let { note } = blockOffData;

    if (!moment(this.originalToDate).isSame(blockOffData.toDateTime)) {
      note += `\n${this.props.t('originalCheckoutDate')}: ${moment(this.originalToDate).format(
        'YYYY-MM-DD hh:mm A'
      )}`;
    }
    if (authService.currentUser.isPordalUser) {
      const blockDateResult = await calendarService.editBlockedDatePordal(
        this.props.selectedReservation,
        moment(blockOffData.fromDateTime).format('YYYY-MM-DD HH:mm:00'),
        moment(blockOffData.toDateTime).format('YYYY-MM-DD HH:mm:00'),
        blockOffData.propertyId,
        1,
        note
      );

      if (blockDateResult.success) {
        this.sendEmailFunc(this.props.t('ownerBlockedDateEdited'));
      } else {
        this.setState({
          errorMessage: blockDateResult.message || this.props.t('errorWhileBlocking'),
        });
        setLoaderVisibility(false);
      }
    } else {
      calendarService
        .editBlockedDate(
          this.props.selectedReservation,
          moment(blockOffData.fromDateTime).format('YYYY-MM-DD HH:mm:00'),
          moment(blockOffData.toDateTime).format('YYYY-MM-DD HH:mm:00'),
          blockOffData.propertyId,
          note,
          blockOffData.toDateTime
        )
        .then(() => {
          this.sendEmailFunc(this.props.t('ownerBlockedDateEdited'));
        })
        .catch((error) => {
          this.setState({
            errorMessage:
              error?.response?.data?.error?.message ||
              error?.response?.data?.message ||
              this.props.t('errorWhileBlocking'),
          });
          setLoaderVisibility(false);
        });
    }
  }

  async blockOffDate(blockOffData) {
    const { setLoaderVisibility } = this.context;
    setLoaderVisibility(true);
    let { note } = blockOffData;
    note += `\n${this.props.t('accessCardQuestion')}: ${this.props.t(this.state.accessCard)}`;
    if (!moment(this.originalToDate).isSame(blockOffData.toDateTime)) {
      note += `\n${this.props.t('originalCheckoutDate')}: ${moment(this.originalToDate).format(
        'YYYY-MM-DD hh:mm A'
      )}`;
    }

    if (authService.currentUser.isPordalUser) {
      const blockDateResult = await calendarService.blockDatePordal(
        moment(blockOffData.fromDateTime).format('YYYY-MM-DD HH:mm:00'),
        moment(blockOffData.toDateTime).format('YYYY-MM-DD HH:mm:00'),
        blockOffData.propertyId,
        1,
        note
      );

      if (blockDateResult.success) {
        this.sendEmailFunc(this.props.t('ownerBlockedDate'), true);
      } else {
        this.setState({
          errorMessage: blockDateResult.message || this.props.t('errorWhileBlocking'),
        });
        setLoaderVisibility(false);
      }
    } else {
      calendarService
        .blockDate(
          moment(blockOffData.fromDateTime).format('YYYY-MM-DD HH:mm:00'),
          moment(blockOffData.toDateTime).format('YYYY-MM-DD HH:mm:00'),
          blockOffData.propertyId,
          note,
          blockOffData.toDateTime
        )
        .then(() => {
          this.sendEmailFunc(this.props.t('ownerBlockedDate'), true);
        })
        .catch((error) => {
          this.setState({
            errorMessage: error?.data?.error?.message || this.props.t('errorWhileBlocking'),
          });
          setLoaderVisibility(false);
        });
    }
  }

  showMessagesAndUpdate(blockOffData) {
    if (blockOffData) {
      this.setState({
        errorMessage: blockOffData.message,
      });
    }
    this.validator.showMessages();
    this.forceUpdate();
  }

  render() {
    const { t } = this.props;

    return (
      <div className="block-off-date-form account-overflow property-overflow">
        <div className="form-group">
          <input
            type="date"
            name="fromDate"
            className="form-control"
            onChange={this.onChangeHandler}
            value={this.state.fromDate}
            min={this.minDate}
            id="inputFromDate"
            placeholder={t('fromDate')}
          />
          {this.validator.message('fromDate', this.state.fromDate, 'required', {
            messages: {
              required: t('common:validationRequired', {
                field: t('fromDate'),
              }),
            },
          })}
        </div>
        <div className="form-group">
          <KeyboardTimePicker
            mask={moment.locale() === 'en' ? '__:__ _M' : '__:__'}
            value={this.state.fromTime}
            invalidDateMessage={t('invalidTime')}
            format={moment.locale() === 'en' ? environment.timeFormat : environment.timeFormatRU}
            onChange={this.onTimeFromChange.bind(this)}
            ampm={moment.locale() === 'en'}
          />
          {this.validator.message(
            'fromTime',
            this.state.fromTime,
            [
              'required',
              {
                timeBiggerOrEqual: [this.state.fromDate, this.minFromTime],
              },
            ],
            {
              messages: {
                required: t('common:validationRequired', {
                  field: t('fromTime'),
                }),
                timeBiggerOrEqual: t('common:timeShouldBeBigger', {
                  field: t('fromTime'),
                  minTime: this.minFromTime,
                }),
              },
            }
          )}
        </div>
        <div className="form-group">
          <input
            type="date"
            name="toDate"
            className="form-control"
            onChange={this.onChangeHandler}
            value={this.state.toDate}
            min={this.minDate}
            id="inputToDate"
            placeholder={t('toDate')}
          />
          {this.validator.message('toDate', this.state.toDate, 'required', {
            messages: {
              required: t('common:validationRequired', {
                field: t('toDate'),
              }),
            },
          })}
        </div>
        <div className="form-group">
          <KeyboardTimePicker
            mask={moment.locale() === 'en' ? '__:__ _M' : '__:__'}
            value={this.state.toTime}
            invalidDateMessage={t('invalidTime')}
            onChange={this.onTimeToChange.bind(this)}
            format={moment.locale() === 'en' ? environment.timeFormat : environment.timeFormatRU}
            ampm={moment.locale() === 'en'}
          />

          {this.validator.message(
            'toTime',
            this.state.toTime,
            [
              'required',
              {
                timeLessOrEqual: [this.state.toDate, '11:59 PM'],
              },
            ],
            {
              messages: {
                required: t('common:validationRequired', {
                  field: t('toTime'),
                }),
                timeLessOrEqual: t('common:timeShouldBeLess', {
                  field: t('toTime'),
                  maxTime: '11:59 PM',
                }),
              },
            }
          )}
          {this.shouldExtendReservation() && (
            <div className="invalid-field">{this.props.t('checkoutAfter11')}</div>
          )}
        </div>

        {!this.props.selectedReservation ? (
          <div className="radio form-group">
            <label htmlFor="accessCard">{t('accessCardQuestion')}</label>
            {this.accessCardValues.map((value) => (
              <div className="form-check" key={value}>
                <input
                  className="form-check-input"
                  name="accessCard"
                  type="radio"
                  id={`accessCard${value}`}
                  onChange={this.onChangeHandler}
                  value={value}
                  checked={this.state.accessCard === value}
                />
                <label htmlFor={`accessCard${value}`} className="form-check-label">
                  {t(value)}
                </label>
              </div>
            ))}
            {this.validator.message('accessCard', this.state.accessCard, ['required'], {
              messages: {
                required: t('common:validationRequired', {
                  field: t('accessCardCheckbox'),
                }),
              },
            })}
          </div>
        ) : null}
        <div className="form-group">
          <textarea
            name="note"
            className="form-control"
            onChange={this.onChangeHandler}
            value={this.state.note}
            id="note"
            placeholder={t('note')}
          />
          {this.state.errorMessage.length ? (
            <div className="invalid-field">{this.state.errorMessage}</div>
          ) : null}
        </div>

        <button
          type="submit"
          onClick={this.onSendClick.bind(this)}
          className="btn block-date-button"
        >
          {t('submit')}
        </button>
        {this.props.selectedReservation ? (
          <button
            type="submit"
            onClick={this.onCancelReservationClick.bind(this)}
            className="btn block-date-button"
          >
            {t('removeReservation')}
          </button>
        ) : null}
      </div>
    );
  }
}

BlockOffDateForm.contextType = LoaderContext;
