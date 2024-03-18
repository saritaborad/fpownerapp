import moment from 'moment';
import React from 'react';
import { toSpaceSeparated } from '../../helpers/numberHelper';

const ReservationDetails = ({ t, reservation, commisionValue, currency, visible }) => {
  const hideClass = visible ? '' : 'invisible';
  const commision = reservation?.extendedProps
    ? reservation.extendedProps.grossRevenue * commisionValue
    : 1;

  return reservation ? (
    <div className={`reservation-details property-overflow ${hideClass}`}>
      <div className="reservation-header header-grayed flex-row">
        <span>{t('reservation')}</span>
      </div>
      <div className="round-separator separator-gray">
        <div className="circle" />
      </div>

      <div className="rows">
        <div className="reservation-detail-row flex-row">
          <span>{`${t('reservation')}:`}</span>
          <span>{reservation.extendedProps.confirmationCode}</span>
        </div>
        <div className="reservation-detail-row flex-row">
          <span>{`${t('name')}:`}</span>
          <span>{reservation.extendedProps.guestName}</span>
        </div>
        <div className="reservation-detail-row flex-row">
          <span>{`${t('checkIn')}:`}</span>
          <span>{moment(reservation.start).format('D.M.Y')}</span>
        </div>
        <div className="reservation-detail-row flex-row">
          <span>{`${t('checkOut')}:`}</span>
          <span>{moment(reservation.end).format('D.M.Y')}</span>
        </div>
        <div className="reservation-detail-row flex-row">
          <span>{`${t('nights')}:`}</span>
          <span>{reservation.extendedProps.nights}</span>
        </div>
        <div className="reservation-detail-row flex-row">
          <span>{`${t('source')}:`}</span>
          <span>{reservation.extendedProps.source}</span>
        </div>
      </div>
      <div className="reservation-header header-grayed flex-row">
        <span>{t('finances')}</span>
      </div>
      <div className="round-separator separator-gray">
        <div className="circle" />
      </div>
      <div className="rows">
        <div className="reservation-detail-row flex-row">
          <span>{`${t('grossRevenue')}:`}</span>
          <span>{`${toSpaceSeparated(reservation.extendedProps.grossRevenue)} ${currency}`}</span>
        </div>
        <div className="reservation-detail-row flex-row">
          <span>{`${t('managementFee')}:`}</span>
          <span>{`-${toSpaceSeparated(commision)} ${currency}`}</span>
        </div>
        <div className="reservation-detail-row flex-row">
          <span>{`${t('totalAmount')}:`}</span>
          <span>
            {`${toSpaceSeparated(reservation.extendedProps.grossRevenue - commision)} ${currency}`}
          </span>
        </div>
        <div className="reservation-detail-row flex-row">
          {/* {authService.currentUser.account.currency}{" "} */}
        </div>
      </div>
    </div>
  ) : (
    ''
  );
};

export default ReservationDetails;
