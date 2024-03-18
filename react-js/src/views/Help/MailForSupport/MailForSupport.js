import React, { useState, useEffect, useRef } from 'react';
import SimpleReactValidator from 'simple-react-validator';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { sendEmail } from 'services/emailService';
import { authService } from 'services/authService';
import { useLoader } from 'components/common/Loader';
import { getProperties } from 'services/propertyService';
import './MailForSupport.scss';

const generalQuestionValue = 'generalQuestion';

export const MailForSupport = ({ setBackVisibility, setPageTitle }) => {
  const { t } = useTranslation('user');
  const { setLoaderVisibility } = useLoader();
  const { propertyId } = useParams();

  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [properties, setProperties] = useState([]);
  const [propertyName, setPropertyName] = useState(generalQuestionValue);
  const [emailSent, setEmailSent] = useState(false);

  const [update, setUpdate] = useState(0);

  const validator = useRef(
    new SimpleReactValidator({
      className: 'invalid-field',
    })
  );

  const showMessagesAndUpdate = () => {
    validator.current.showMessages();
    setUpdate(update + 1);
  };

  useEffect(() => {
    getProp();
    setBackVisibility(true);
    setPageTitle(t('mailForSupport'));
  }, []);

  const onSendClick = (event) => {
    event.preventDefault();
    if (validator.current.allValid()) {
      const user = authService.currentUser;
      sendEmailFunc(user);
    } else {
      showMessagesAndUpdate();
    }
  };

  const getProp = async () => {
    setLoaderVisibility(true);
    try {
      const res = await getProperties(authService.currentUser.userId);
      setProperties(res.properties);
      const selectedProperty = res.properties.find(
        ({ property_id: propId }) => propId === propertyId
      );
      if (selectedProperty) {
        setPropertyName(selectedProperty.nickname);
      }
    } catch (err) {
      console.error(err);
    }
    setLoaderVisibility(false);
  };

  const sendEmailFunc = async (user) => {
    if (emailSent) {
      return;
    }
    setLoaderVisibility(true);
    setErrorMessage('');

    const subject = `${t('supportMail')} : ${
      propertyName === generalQuestionValue ? t('generalQuestion') : propertyName
    } - ${user.fullName}`;

    try {
      await sendEmail(user, subject, message);
      setEmailSent(true);
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (err) {
      setErrorMessage(err);
    }
    setLoaderVisibility(false);
  };

  return (
    <div className="mail-for-support property-overflow">
      <form noValidate>
        <div className="form-group">
          <select
            className="form-control"
            name="propertyName"
            value={propertyName}
            onChange={(e) => setPropertyName(e.target.value)}
            placeholder={t('propertyName')}
          >
            <option value={generalQuestionValue}>{t('generalQuestion')}</option>
            {properties?.map(({ nickname }) => (
              <option value={nickname} key={nickname}>
                {nickname}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <textarea
            name="message"
            className="form-control"
            onChange={(e) => setMessage(e.target.value)}
            value={message}
            id="message"
            placeholder={t('body')}
          />
          {validator.current.message('body', message, 'required', {
            messages: {
              required: t('common:validationRequired', {
                field: t('body'),
              }),
            },
          })}
          {errorMessage.length ? <div className="invalid-field">{errorMessage}</div> : null}
        </div>

        <button
          type="submit"
          disabled={emailSent}
          onClick={onSendClick}
          className="btn send-mail-button"
        >
          {t('submit')}
        </button>
        {emailSent ? <div className="email-sent-info">{t('emailSentMessage')}</div> : ''}
      </form>
    </div>
  );
};

export default MailForSupport;
