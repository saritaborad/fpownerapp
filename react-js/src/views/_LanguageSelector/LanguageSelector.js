import classNames from 'classnames';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from 'i18n';
import './LanguageSelector.scss';

const LANGUAGES = ['en', 'ar', 'ru'];

const LanguageSelector = () => {
  const [selectorVisible, setSelectorVisible] = useState(false);
  const { t } = useTranslation('common');

  const toggleSelector = () => {
    setSelectorVisible(!selectorVisible);
  };

  const hideSelector = () => {
    setSelectorVisible(false);
  };

  const selectLanguage = (value) => {
    i18n.changeLanguage(value);
  };

  return (
    <div className="language-selector" onClick={toggleSelector}>
      <span className="selected-language">{t(i18n.language)}</span>
      <div className={classNames('triangle-selector', { rotate: selectorVisible })} />
      {selectorVisible && (
        <div className="language-block">
          <div className="overlay" onClick={hideSelector} />
          <div className="languages-list-content">
            <ul>
              {LANGUAGES.map((lang) => (
                <li key={lang} onClick={() => selectLanguage(lang)}>
                  {t(lang)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
