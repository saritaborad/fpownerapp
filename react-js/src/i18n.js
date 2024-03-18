import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import I18nextBrowserLanguageDetector from 'i18next-browser-languagedetector';
import calendarEn from './translations/en/calendar.json';
import commonEn from './translations/en/common.json';
import formEn from './translations/en/form.json';
import propertiesEn from './translations/en/properties.json';
import statementsEn from './translations/en/statements.json';
import userEn from './translations/en/user.json';
import calendarRu from './translations/ru/calendar.json';
import commonRu from './translations/ru/common.json';
import propertiesRu from './translations/ru/properties.json';
import statementsRu from './translations/ru/statements.json';
import userRu from './translations/ru/user.json';
import formRu from './translations/ru/form.json';
import calendarAr from './translations/ar/calendar.json';
import commonAr from './translations/ar/common.json';
import propertiesAr from './translations/ar/properties.json';
import statementsAr from './translations/ar/statements.json';
import userAr from './translations/ar/user.json';
import formAr from './translations/ar/form.json';

i18n
  .use(I18nextBrowserLanguageDetector)
  .use(initReactI18next)
  .init({
    interpolation: { escapeValue: false },
    fallbackLng: 'en',
    supportedLngs: ['en', 'ru', 'ar'],
    resources: {
      en: {
        common: commonEn,
        statements: statementsEn,
        properties: propertiesEn,
        calendar: calendarEn,
        user: userEn,
        form: formEn,
      },
      ru: {
        common: commonRu,
        statements: statementsRu,
        properties: propertiesRu,
        calendar: calendarRu,
        user: userRu,
        form: formRu,
      },
      ar: {
        common: commonAr,
        statements: statementsAr,
        properties: propertiesAr,
        calendar: calendarAr,
        user: userAr,
        form: formAr,
      },
    },
  });

if (localStorage.getItem('i18nextLng') === 'ru') {
  // eslint-disable-next-line global-require
  require('moment/locale/ru.js');
}
// if (localStorage.getItem("i18nextLng") === "ar") {
//   require("moment/locale/ar.js");
// }

i18n.on('languageChanged', () => {
  window.location.reload();
});

export default i18n;
