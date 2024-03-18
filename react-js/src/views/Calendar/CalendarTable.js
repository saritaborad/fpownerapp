import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import React from 'react';
import i18n from 'i18n';

export default class CalendarTable extends React.Component {
  calendarComponentRef = React.createRef();

  constructor(props) {
    super(props);
    this.selectReservation = this.selectReservation.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (this.props.dateObject !== prevProps.dateObject) {
      const calendarApi = this.calendarComponentRef.current.getApi();
      calendarApi.gotoDate(this.props.dateObject.format('Y-MM-DD'));
    }
  }

  changeDate(quantity, unit) {
    this.props.changeCalendarDate(quantity, unit).then(() => {});
  }

  selectReservation(info) {
    if (info.event.rendering === 'background') {
      return;
    }
    this.props.setSelectedReservation(info.event);
    this.props.showReservationDetails(true);
  }

  dateClick(event) {
    if (this.props.dateClick) {
      this.props.dateClick(event.date);
    }
  }

  render() {
    const { t } = this.props;

    return (
      <div className="calendar-table-container">
        <div className="calendar-header">
          <div className="year-column">
            <span className="prevYear">
              <i className="icon icon-prev" onClick={this.changeDate.bind(this, -1, 'year')} />
            </span>
            <span className="year">{this.props.dateObject.format('Y')}</span>
            <span className="nextYear">
              <i className="icon icon-next" onClick={this.changeDate.bind(this, 1, 'year')} />
            </span>
          </div>
          <div className="month-column">
            <span className="prevMonth">
              <i className="icon icon-prev" onClick={this.changeDate.bind(this, -1, 'month')} />
            </span>
            <span className="month">
              {t(`common:${this.props.dateObject.format('MMMM').toLowerCase()}`)}
            </span>
            <span className="nextMonth">
              <i className="icon icon-next" onClick={this.changeDate.bind(this, 1, 'month')} />
            </span>
          </div>
        </div>
        <FullCalendar
          dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
          locale={i18n.language}
          defaultView="dayGridMonth"
          defaultDate={this.props.dateObject.format('YYYY-MM-DD')}
          dateClick={this.dateClick.bind(this)}
          displayEventTime={false}
          contentHeight="auto"
          plugins={[dayGridPlugin, interactionPlugin]}
          ref={this.calendarComponentRef}
          firstDay={1}
          header={{
            left: '',
            center: '',
            right: '',
          }}
          weekends
          events={this.props.reservations}
          eventClick={this.selectReservation}
        />
      </div>
    );
  }
}
