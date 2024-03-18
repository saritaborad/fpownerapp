import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router';

import './ThankYouPage.scss';

const ThankYouPage = () => {
  const { t } = useTranslation('form');
  const { history } = useHistory();

  const onLinkClick = () => {
    if (history?.location.pathname === '/settings') {
      window.location.reload();
    }
  };

  return (
    <div className="thank-you-page">
      <h1 className="edit-profile-header">{t('thankYou')}</h1>
      <div className="round-separator">
        <div className="circle" />
      </div>
      <p>
        {t('thankYouForOnBoard')}
        <br />

        <span>
          {`${t('youCanChangeInfo1')} `}
          <a href="/#/settings?initialize=true" onClick={onLinkClick}>
            {t('youCanChangeInfoEdit')}
          </a>
          {` ${t('youCanChangeInfo2')}`}
        </span>
      </p>
    </div>
  );
};

export default ThankYouPage;
