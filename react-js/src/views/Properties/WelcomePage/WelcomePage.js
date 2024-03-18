import React from 'react';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './WelcomePage.scss';

const WelcomePage = ({ isRussian }) => {
  const { t } = useTranslation('form');
  const history = useHistory();
  const startSurvey = () => {
    history.push('/settings/initialize');
  };

  return !isRussian ? (
    <div className="welcome-page">
      <p className="welcome-text">{t('welcome')}</p>
      <div className="round-separator">
        <div className="circle" />
      </div>
      <h1 className="edit-profile-header">{t('welcomeToFrankPorter')}</h1>
      <p className="initialize-profile-paragraph">
        {t('welcomeText1st')}
        <br />
        {t('welcomeText2nd')}
      </p>
      <div className="buttons">
        <button className="btn btn-next" onClick={startSurvey} type="button">
          {t('start')}
        </button>
      </div>
    </div>
  ) : null;
};

export default WelcomePage;
