import React from 'react';
import { toSpaceSeparated } from '../../helpers/numberHelper';
import { calendarService } from '../../services/calendarService';

export default class Statistics extends React.Component {
  constructor(props) {
    super(props);
    // eslint-disable-next-line
    let cancelToken = null;
    this.state = {
      statistics: null,
    };
  }

  componentDidMount() {
    this.getStatistics();
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.month === prevProps.month &&
      this.props.year === prevProps.year &&
      this.props.propertyId === prevProps.propertyId
    ) {
      return;
    }
    this.cancelRequestIfPossible();
    this.getStatistics();
  }

  getStatistics() {
    this.cancelRequestIfPossible();

    const { promise, cancelToken } = calendarService.getStatistics(
      this.props.propertyId,
      this.props.month,
      this.props.year
    );
    this.cancelToken = cancelToken;
    promise
      .then((statistics) => {
        this.setState({
          statistics: statistics || {},
        });
      })
      .catch(() => {
        this.cancelToken = null;
      })
      .then(() => {
        this.cancelToken = null;
      });
  }

  cancelRequestIfPossible() {
    if (this.cancelToken) {
      this.cancelToken.cancel();
      this.cancelToken = null;
    }
  }

  render() {
    const { statistics } = this.state;
    const { t } = this.props;
    const { currency } = this.props;

    return (
      statistics && (
        <div className="calendar-statistics">
          <div className="header">
            {`${t('details')} ${t(`common:${this.props.monthName.toLowerCase()}`)}`}
          </div>
          <div className="round-separator separator-gray">
            <div className="circle" />
          </div>
          <div className="statistics-detail-row flex-row">
            <span className="name">{`${t('earnings')}:`}</span>
            <span>
              {`${currency} ${statistics.earning ? toSpaceSeparated(statistics.earning, true) : 0}`}
            </span>
          </div>
          {statistics.avg_night_rate !== null ? (
            <div className="statistics-detail-row flex-row">
              <span className="name">{`${t('averageNightlyRate')}:`}</span>
              <span>
                {`${currency} ${
                  statistics.avg_night_rate ? toSpaceSeparated(statistics.avg_night_rate, true) : 0
                }`}
              </span>
            </div>
          ) : (
            ''
          )}
          <div className="statistics-detail-row flex-row">
            <span className="name">{`${t('stays')}:`}</span>
            <span>{statistics.stays}</span>
          </div>
          <div className="statistics-detail-row flex-row">
            <span className="name">{`${t('nights')}:`}</span>
            <span>{statistics.nights}</span>
          </div>
          <div className="statistics-detail-row flex-row">
            <span className="name">{`${t('occupancyRate')}:`}</span>
            <span>
              {`${
                statistics.occupancy_rate ? toSpaceSeparated(statistics.occupancy_rate, true, 0) : 0
              }%`}
            </span>
          </div>
          <div className="round-separator separator-gray">
            <div className="circle" />
          </div>
        </div>
      )
    );
  }
}
