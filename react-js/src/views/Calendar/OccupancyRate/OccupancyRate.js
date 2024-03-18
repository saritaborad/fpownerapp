import ComponentSlider from '@kapost/react-component-slider';
import moment from 'moment';
import React from 'react';
import { PieChart } from 'react-minimal-pie-chart';
import { calendarService } from '../../../services/calendarService';
import { isMobile } from '../../../helpers/isMobile';
import './OccupancyRate.scss';

export default class OccupancyRate extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      monthsRate: null,
    };
    this.getOccupancyRate = this.getOccupancyRate.bind(this);
    this.calculateMonthsRate = this.calculateMonthsRate.bind(this);
  }

  componentDidMount() {
    this.getOccupancyRate();
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.dateObject.format('YYYY-MM-DD') !== prevProps.dateObject.format('YYYY-MM-DD') ||
      this.props.propertyId !== prevProps.propertyId
    ) {
      this.getOccupancyRate();
    }
  }

  getOccupancyRate() {
    const fromDate = moment(this.props.dateObject)
      .add(-1, 'month')
      .startOf('month')
      .format('YYYY-MM-DD');
    const toDate = moment(this.props.dateObject)
      .add(4, 'month')
      .endOf('month')
      .format('YYYY-MM-DD');

    calendarService
      .getCalendarByProperty(this.props.propertyId, fromDate, toDate)
      .then((calendar) => {
        this.calculateMonthsRate(this.divideByMonths(calendar));
      });
  }

  divideByMonths(calendar) {
    const months = {};

    calendar.forEach((day) => {
      const currentMonth = moment(day.date).format('MMMM');
      if (!months[currentMonth]) {
        months[currentMonth] = {
          free: 0,
          booked: 0,
          days: moment(day.date).daysInMonth(),
        };
      }
      if (day.status === 'available') {
        months[currentMonth].free += 1;
      } else if (day.status === 'booked') {
        months[currentMonth].booked += 1;
      }
    });

    return months;
  }

  calculateMonthsRate(months) {
    const monthsRate = [];
    Object.keys(months).forEach((month) => {
      monthsRate.push({
        month,
        rate: Math.round((months[month].booked / months[month].days) * 100),
        booked: months[month].booked,
        days: months[month].days,
      });
    });

    this.setState({
      monthsRate,
    });
  }

  renderMonthsRate() {
    const { t } = this.props;

    return this.state.monthsRate.map((month) => (
      <div key={month.month} className="month-rate-column menu-item">
        <p className="month-name">{t(`common:${month.month.toLowerCase()}`)}</p>
        <span className="month-rate">{`${month.rate}%`}</span>
        <div className="pie-chart">
          <PieChart
            data={[
              {
                title: 'Free',
                value: month.days - month.booked,
                color: '#EEECEA',
              },
              { title: 'Booked', value: month.booked, color: '#BC9D78' },
            ]}
            startAngle={0}
            animate
            animationDuration={500}
            animationEasing="ease-out"
          />
        </div>
      </div>
    ));
  }

  render() {
    const { t } = this.props;

    return (
      <div className="occupancyRate">
        <h1 className="container-heading mt-3 only-desktop">{t('occupancyRate')}</h1>
        <div className={isMobile() ? 'occupancy-slider-mobile' : 'occupancy-slider-pc'}>
          {this.state.monthsRate ? (
            <ComponentSlider renderRightArrow={renderRightArrow} renderLeftArrow={renderLeftArrow}>
              {this.renderMonthsRate()}
            </ComponentSlider>
          ) : (
            ''
          )}
        </div>
      </div>
    );
  }
}

const renderLeftArrow = () => <span className="icon icon-arrow arrow-left" />;
const renderRightArrow = () => <span className="icon icon-arrow" />;
