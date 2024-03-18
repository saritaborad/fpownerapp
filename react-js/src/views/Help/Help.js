import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useParams } from 'react-router-dom';
import Navigation from 'views/_PrivateLayout/Navigation';
import './Help.scss';

const Help = ({ setPageTitle, setBackVisibility }) => {
  const history = useHistory();
  const { t } = useTranslation('user');
  const { propertyId } = useParams();

  useEffect(() => {
    setBackVisibility(false);
    setPageTitle(t('common:help'));

    document.addEventListener('backbutton', backClick);

    return () => {
      document.removeEventListener('backbutton', backClick);
    };
  }, []);

  const backClick = () => {
    history.push('/properties');
  };

  return (
    <div className="container help-container">
      <ul className="account-items">
        <li onClick={() => history.push(`/help/faq/${propertyId || ''}`)}>
          <div className="item-name">{t('FAQs')}</div>
          <div className="column-arrow">
            <i className="icon icon-arrow" />
          </div>
        </li>
        <li onClick={() => history.push(`/help/contact-support/${propertyId || ''}`)}>
          <div className="item-name">{t('mailForSupport')}</div>
          <div className="column-arrow">
            <i className="icon icon-arrow" />
          </div>
        </li>
      </ul>
      <Navigation selected="help" propertyId={propertyId} />
    </div>
  );
};

export default Help;
