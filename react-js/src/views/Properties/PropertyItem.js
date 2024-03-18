import React from 'react';
import './Properties.scss';

const PropertyItem = ({ property, t, onPropertyClick }) => {
  const { picture, address, address_2: address2, is_active: active, bedrooms, nickname } = property;
  const thumbnail = picture?.startsWith('http')
    ? picture
    : picture?.startsWith('//')
    ? `https:${picture}`
    : `https//:${picture}`;

  return (
    <div className="property" onClick={() => onPropertyClick(property)} role="button" tabIndex="0">
      <div className="property-picture">
        <div
          className="picture"
          style={{
            backgroundImage: `url(${thumbnail})`,
          }}
        />
      </div>
      <div className="property-info">
        <p className="property-nickname property-single-line">
          <i className="icon icon-home" />
          {nickname}
        </p>
        <p className="property-location property-single-line">{address2 || address}</p>
        <div className="round-separator">
          <div className="circle" />
        </div>
        <div className="property-last">
          <span className="property-bedrooms">
            {bedrooms > -1 ? (
              <>
                {bedrooms > 1
                  ? `${bedrooms} ${t('bedrooms')}`
                  : bedrooms > 0
                  ? `${bedrooms} ${t('bedroom')}`
                  : t('studio')}
              </>
            ) : null}
          </span>
          <div className={`property-activity${active ? ' property-active' : ''}`}>
            <i className="icon icon-tick" />
            <span className="property-activity-text">{active ? t('active') : t('inactive')}</span>
          </div>
        </div>
      </div>
      <div className="column-arrow">
        <i className="icon icon-arrow" />
      </div>
    </div>
  );
};

export default PropertyItem;
