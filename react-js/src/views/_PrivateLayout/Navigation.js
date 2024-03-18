import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import './Navigation.scss';

const Navigation = ({ selected, propertyId }) => {
  const history = useHistory();
  const { t } = useTranslation('common');

  const onDocumentsClick = () => {
    if (!propertyId) {
      return;
    }
    history.push(`/documents/statements/${propertyId}`);
  };

  const onCalendarClick = () => {
    if (!propertyId) {
      return;
    }
    history.push(`/calendar/${propertyId}`);
  };

  const onSettingsClick = () => history.push(`/settings/list/${propertyId || ''}`);

  const onHelpClick = () => history.push(`/help/${propertyId || ''}`);

  return (
    <div className="navigation-container">
      <div className="navigation-col">
        <div
          className={`navigation-button${selected === 'calendar' ? ' active' : ''}${
            !propertyId ? ' disabled' : ''
          }`}
          onClick={onCalendarClick}
        >
          <div className={`icon-container ${selected === 'calendar' ? 'icon-selected' : ''}`}>
            <i className="icon icon-calendar" />
          </div>
          <span className="navigation-button-text">{t('calendar')}</span>
        </div>
      </div>
      <div className="navigation-col">
        <div
          className={`navigation-button${selected === 'documents' ? ' active' : ''}${
            !propertyId ? ' disabled' : ''
          }`}
          onClick={onDocumentsClick}
        >
          <div className={`icon-container ${selected === 'documents' ? 'icon-selected' : ''}`}>
            <i className="icon icon-statements" />
          </div>
          <span className="navigation-button-text">{t('documents')}</span>
        </div>
      </div>
      <div className="navigation-col">
        <div
          className={`navigation-button${selected === 'settings' ? ' active' : ''}`}
          onClick={onSettingsClick}
        >
          <div className={`icon-container ${selected === 'settings' ? 'icon-selected' : ''}`}>
            <i className="icon icon-settings" />
          </div>
          <span className="navigation-button-text">{t('settings')}</span>
        </div>
      </div>
      <div className="navigation-col">
        <div
          className={`navigation-button${selected === 'help' ? ' active' : ''}`}
          onClick={onHelpClick}
        >
          <div className={`icon-container ${selected === 'help' ? 'icon-selected' : ''}`}>
            <i className="icon icon-help" />
          </div>
          <span className="navigation-button-text">{t('help')}</span>
        </div>
      </div>
    </div>
  );
};

export default Navigation;
