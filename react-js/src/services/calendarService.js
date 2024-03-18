import Axios from 'axios';
import moment from 'moment';
import environment from '../environments/environment';

export default class CalendarService {
  getCalendarByProperty(propertyId, fromDate, toDate) {
    return new Promise((resolve, reject) => {
      Axios.get(`${environment.ownerApi}/calendar`, {
        params: {
          listingId: propertyId,
          from: fromDate,
          to: toDate,
        },
      })
        .then((reservations) => {
          resolve(reservations.data);
        })
        .catch((error) => reject(error));
    });
  }

  unblockDate(reservationId) {
    const data = {
      apiKey: environment.apiKey,
    };

    const url = `${environment.guestyApi2}/owners-reservations/${reservationId}`;

    return new Promise((resolve, reject) => {
      Axios.post(url, data)
        .then((reservations) => {
          resolve(reservations.data);
        })
        .catch((error) => reject(error));
    });
  }

  blockDate(dateTimeFrom, dateTimeTo, listingId, note, to) {
    const data = {
      apiKey: environment.apiKey,
      checkIn: dateTimeFrom,
      checkOut: dateTimeTo,
      listingId,
      note,
      to,
    };

    const url = `${environment.guestyApi2}/owners-reservations`;

    return new Promise((resolve, reject) => {
      Axios.post(url, data)
        .then((reservations) => {
          if (reservations.data.id) {
            resolve(reservations.data);
          } else {
            // eslint-disable-next-line prefer-promise-reject-errors
            reject(false);
          }
        })
        .catch((error) => reject(error.response));
    });
  }

  async blockDatePordal(checkIn, checkOut, propertyId, occupancy, note) {
    const data = {
      checkIn,
      checkOut,
      propertyId,
      occupancy,
      note,
    };
    try {
      const result = await Axios.post(`${environment.pordalApi}/owner-reservation`, data);

      if (result.data.id) {
        return {
          success: true,
          ...result.data,
        };
      }

      throw new Error('An error occured');
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.detail || error,
      };
    }
  }

  async editBlockedDatePordal(reservationId, checkIn, checkOut, propertyId, occupancy, note) {
    const data = {
      checkIn,
      checkOut,
      propertyId,
      occupancy,
      note,
    };
    try {
      const result = await Axios.put(
        `${environment.pordalApi}/owner-reservation/${reservationId}`,
        data
      );

      if (result.data.id) {
        return {
          success: true,
          ...result.data,
        };
      }

      throw new Error('An error occured');
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.detail || error,
      };
    }
  }

  async unblockDatePordal(reservationId) {
    try {
      const result = await Axios.delete(
        `${environment.pordalApi}/owner-reservation/${reservationId}`
      );
      if (result.status.toString().startsWith('2')) {
        return {
          success: true,
          ...result.data,
        };
      }

      throw new Error('An error occured');
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.detail || error,
      };
    }
  }

  editBlockedDate(reservationId, dateTimeFrom, dateTimeTo, listingId, note, to) {
    const data = {
      apiKey: environment.apiKey,
      checkIn: dateTimeFrom,
      checkOut: dateTimeTo,
      listingId,
      note,
      to,
    };

    const url = `${environment.guestyApi2}/owners-reservations/${reservationId}`;

    return new Promise((resolve, reject) => {
      Axios.put(url, data)
        .then((reservations) => {
          resolve(reservations.data);
        })
        .catch((error) => reject(error));
    });
  }

  getStatistics(propertyId, month, year) {
    const { CancelToken } = Axios;
    const source = CancelToken.source();
    const data = `property_id=${propertyId}&month=${month}&year=${year}`;

    return {
      cancelToken: source,
      promise: new Promise((resolve, reject) => {
        Axios.post(`${environment.ownerApi}/statistics`, data, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          cancelToken: source.token,
        })
          .then((response) => {
            resolve(response.data.data);
          })
          .catch((error) => {
            reject(error);
          });
      }),
    };
  }

  getReservations(propertyId, dateFrom, dateTo, forceUpdate) {
    const filters = [
      {
        field: 'checkInDateLocalized',
        operator: '$lte',
        value: dateTo,
      },
      {
        field: 'checkOutDateLocalized',
        operator: '$gte',
        value: dateFrom,
      },
      {
        field: 'status',
        operator: '$in',
        value: ['confirmed', 'checked_in'],
      },
      {
        field: 'listingId',
        operator: '$eq',
        value: propertyId,
      },
    ];

    const url = `${environment.ownerApi}/reservations`;

    return new Promise((resolve, reject) => {
      Axios.get(url, {
        params: {
          sort: 'checkIn',
          filters: JSON.stringify(filters),
          forceUpdate,
        },
      })
        .then((reservations) => {
          resolve(this.mapReservations(reservations.data.results));
        })
        .catch((error) => reject(error));
    });
  }

  getBlockedDays(propertyId, dateFrom, dateTo, ownerBlockedString, forceUpdate) {
    return new Promise((resolve, reject) => {
      Axios.get(`${environment.ownerApi}/calendar`, {
        params: {
          listingId: propertyId,
          from: dateFrom,
          to: dateTo,
          forceUpdate,
        },
      })
        .then((response) => {
          resolve(this.mapBlockedDays(response.data, ownerBlockedString));
        })
        .catch((error) => reject(error));
    });
  }

  mapReservations(reservations) {
    return reservations.map((reservation) => {
      let checkout = reservation.checkOut;
      const checkoutMoment = moment(reservation.checkOut);

      if (checkoutMoment.hours() === 0 && checkoutMoment.minutes() === 0) {
        checkout = checkoutMoment.add(1, 'second').format('YYYY-MM-DD HH:mm:ss');
      }

      return {
        id: reservation._id,
        confirmationCode: reservation.confirmationCode,
        start: reservation.checkIn,
        end: checkout,
        nights: reservation.nightsCount,
        source: reservation.integration.platform,
        guestName: reservation.guest.fullName,
        title: `${reservation.integration.platform} | ${reservation.guest.fullName}`,
        grossRevenue: reservation.money.netIncome,
        managementFee: reservation.money.commissionIncTax,
        netRevenue: reservation.money.ownerRevenue,
      };
    });
  }

  mapBlockedDays(blockedDays, ownerBlockedString) {
    const ownerReservations = [];
    const unavailableDays = [];
    let unavailableDaysRange = {
      start: null,
      end: null,
      rendering: 'background',
    };
    // eslint-disable-next-line
    blockedDays.forEach((day) => {
      if (day.status === 'unavailable' && day.blocks.o) {
        if (!ownerReservations.find((reservation) => reservation.id === day.ownerReservationId)) {
          const nightsCount = moment(day.ownersReservation.checkOut)
            .hour(0)
            .diff(moment(day.ownersReservation.checkIn).hour(0), 'days');
          let checkout = day.ownersReservation.checkOut;
          const checkoutMoment = moment(day.ownersReservation.checkOut);
          if (checkoutMoment.hours() === 0 && checkoutMoment.minutes() === 0) {
            checkout = checkoutMoment.add(1, 'second').format('YYYY-MM-DD HH:mm:ss');
          }
          ownerReservations.push({
            id: day.ownerReservationId,
            guestName: ownerBlockedString || 'Owner blocked',
            title: ownerBlockedString || 'Owner blocked',
            confirmationCode: day.ownerReservationId,
            start: day.ownersReservation.checkIn,
            end: checkout,
            nights: nightsCount,
            guest: {},
            note: day.ownersReservation.note,
            ownerReservation: true,
          });
        }
      }
      if (day.status === 'unavailable' && !day.blocks.o) {
        if (!unavailableDaysRange.start) {
          unavailableDaysRange.start = day.date;
        }
        unavailableDaysRange.end = day.date;
      }
      if ((day.status === 'available' || day.status === 'booked') && unavailableDaysRange.end) {
        unavailableDaysRange.end = day.date;
        unavailableDays.push({ ...unavailableDaysRange });
        unavailableDaysRange = {
          end: null,
          start: null,
          rendering: 'background',
        };
      }
    });
    if (unavailableDaysRange.start) {
      unavailableDaysRange.end = moment(blockedDays[blockedDays.length - 1].date)
        .add(1, 'day')
        .format('YYYY-MM-DD');
      unavailableDays.push({ ...unavailableDaysRange });
      unavailableDaysRange = {
        end: null,
        start: null,
        rendering: 'background',
      };
    }

    return [...ownerReservations, ...unavailableDays];
  }

  async getOwnerPordalReservations(ownerBlockedString, propertyId, date) {
    try {
      const mainResult = await Axios.get(`${environment.pordalApi}/owner-reservation`, {
        params: {
          filter: JSON.stringify([
            { field: 'propertyId', type: 'eq', value: propertyId },
            {
              type: 'orx',
              conditions: [
                { field: 'checkIn', type: 'eq', value: date },
                { field: 'checkOut', type: 'eq', value: date },
              ],
            },
          ]),
        },
      });

      // TODO if owners reservation quantity is above 25 it need to be paginated. How to paginate over this API?

      if (!mainResult.data._embedded.items) {
        throw new Error('An error occured');
      }

      const reservations = mainResult.data._embedded.items;

      return {
        success: true,
        items: reservations
          .filter(({ status }) => status === 'confirmed')
          .map((reservation) => ({
            id: reservation.id,
            guestName: 'Owner blocked',
            title: ownerBlockedString || 'Owner blocked',
            confirmationCode: reservation.confirmationCode,
            start: reservation.checkIn,
            end: reservation.checkOut,
            nights: reservation.nights,
            guest: {},
            note: reservation.note,
            ownerReservation: true,
          })),
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.detail || error,
      };
    }
  }
}

export const calendarService = new CalendarService();
