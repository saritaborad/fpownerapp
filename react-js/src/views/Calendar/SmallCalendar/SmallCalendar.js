import React from 'react';
import moment from 'moment';
import classNames from 'classnames';
import { calendarService } from 'services/calendarService';
import './SmallCalendar.scss';
import i18n from 'i18n';

export default class SmallCalendar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      guestyCalendar: null,
    };
    this.getGuestyCalendar = this.getGuestyCalendar.bind(this);
  }

  componentDidMount() {
    this.getGuestyCalendar();
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.dateObject.format('YYYY-MM-DD') !== prevProps.dateObject.format('YYYY-MM-DD') ||
      this.props.propertyId !== prevProps.propertyId
    ) {
      this.getGuestyCalendar();
    }
  }

  getGuestyCalendar() {
    const fromDate = moment(this.props.dateObject).startOf('month').format('YYYY-MM-DD');
    const toDate = moment(this.props.dateObject).endOf('month').format('YYYY-MM-DD');
    calendarService
      .getCalendarByProperty(this.props.propertyId, fromDate, toDate)
      .then((response) => {
        this.setState({
          guestyCalendar: response,
        });
      });
  }

  getTotalCalendarDays() {
    const blanks = [];
    for (let i = 0; i < this.firstDayOfMonth(); i++) {
      blanks.push(<td key={`empty-${i}`} className="calendar-day empty" />);
    }

    const monthDays = [];
    for (let day = 1; day <= this.state.guestyCalendar.length; day++) {
      monthDays.push(
        <td key={day} className={`calendar-day ${this.state.guestyCalendar[day - 1].status}`}>
          <span className={`day ${this.state.guestyCalendar[day - 1].status} `}>{day}</span>
        </td>
      );
    }

    return [...blanks, ...monthDays];
  }

  getCalendarMappedByWeeks() {
    const totalCalendarDays = this.getTotalCalendarDays();

    const weekRows = [];
    let dayCellsTemp = [];

    totalCalendarDays.forEach((row, i) => {
      if (i % 7 !== 0) {
        dayCellsTemp.push(row);
      } else {
        weekRows.push(dayCellsTemp);
        dayCellsTemp = [];
        dayCellsTemp.push(row);
      }
      if (i === totalCalendarDays.length - 1) {
        weekRows.push(dayCellsTemp);
      }
    });

    // eslint-disable-next-line react/no-array-index-key
    return weekRows.map((dayCells, i) => <tr key={i}>{dayCells}</tr>);
  }

  firstDayOfMonth = () => this.props.dateObject.startOf('month').format('d'); // Day of week 0...1..5...6

  render() {
    const { t } = this.props;
    const weekdayShortName = moment
      .weekdaysShort()
      .map((day) => <th key={day}>{t(`common:${day.toLowerCase()}`)}</th>);

    return this.state.guestyCalendar ? (
      <div className="smallCalendar">
        <div className="smallCalendar-container">
          <div className="calendar-month">
            {t(`common:${this.props.dateObject.format('MMMM').toLowerCase()}`)}
          </div>

          <div className="calendar">
            <table
              className={classNames('calendar-table', {
                rtl: i18n.language === 'ar',
              })}
            >
              <thead>
                <tr>{weekdayShortName}</tr>
              </thead>
              <tbody>{this.getCalendarMappedByWeeks()}</tbody>
            </table>
          </div>
        </div>
      </div>
    ) : (
      ''
    );
  }
}
