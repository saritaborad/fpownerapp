import { AppSidebarToggler } from '@coreui/react';
import React from 'react';
import LanguageSelector from '../_LanguageSelector/LanguageSelector';
import { Notifications } from './Notifications';

const Header = (props) => {
  const {
    t,
    history,
    goBack,
    pageTitle,
    searchValue,
    setSearchValue,
    isSearchbarVisible,
    homeVisible,
    goBackVisible,
    settingsVisible,
    notificationVisible,
  } = props;

  const onHomeClick = () => {
    history.push(`/properties`);
  };

  const onSettingsClick = () => {
    history.push(`/settings`);
  };

  return (
    <div className="topbar">
      {goBackVisible ? null : <AppSidebarToggler className="d-md-down-none" display="lg" />}
      <div className="header-col header-col-left">
        {homeVisible ? (
          <i className="icon icon-home hide-desktop" onClick={onHomeClick.bind(this)} />
        ) : null}
        {settingsVisible ? (
          <i
            className="icon icon-settings-header hide-desktop"
            onClick={onSettingsClick.bind(this)}
          />
        ) : null}
        {goBackVisible ? <i className="icon icon-back" onClick={goBack} /> : null}
        {history.location.pathname.includes('properties') && isSearchbarVisible && (
          <div>
            <input
              className="properties-search-input"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              name="search"
              type="text"
              placeholder={t('search')}
            />
          </div>
        )}
      </div>
      <div className="header-col header-col-center">
        {pageTitle ? <span className="page-title">{pageTitle}</span> : null}
      </div>
      <div className="header-col header-col-right">
        <LanguageSelector />
        {notificationVisible && <Notifications {...props} />}
      </div>
    </div>
  );
};

export default Header;
