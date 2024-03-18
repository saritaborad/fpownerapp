/* eslint-disable max-statements */
/* eslint-disable complexity */
import { ReactComponent as BackIcon } from 'assets/back.svg';
import { ReactComponent as NextIcon } from 'assets/nextTriangle.svg';
import classNames from 'classnames';
import Button from 'components/common/Button';
import { useLoader } from 'components/common/Loader';
import { useSurvey } from 'hooks/useSurvey';
import { SurveySummary } from 'hooks/useSurvey/models';
import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import { PropertySummaryProps } from './models';
import style from './style.module.scss';

const PropertySummary: FC<PropertySummaryProps> = ({
  match: {
    params: { propertyId },
  },
  setBackVisibility,
}) => {
  // eslint-disable-next-line
  const { t } = useTranslation('form');
  const history = useHistory();
  const [summary, setSummary] = useState<SurveySummary>();
  const { getSurveySummary, mapSurveyForSummary } = useSurvey();
  const { setLoaderVisibility } = useLoader();

  useEffect(() => {
    const init = async () => {
      setLoaderVisibility(true);
      // eslint-disable-next-line no-underscore-dangle
      const survey = await getSurveySummary({ propertyId });
      setSummary(mapSurveyForSummary(survey));
      setLoaderVisibility(false);
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId]);

  const onBackClick = () => {
    setBackVisibility(false);
    history.push(`/settings/list/${propertyId}`);
  };

  if (!summary) {
    return null;
  }

  return (
    <div className={style.wrapper}>
      <header className={style.header}>
        <Button
          prefix={<BackIcon />}
          variant="outline"
          className={style.backButton}
          value={t('back') as string}
          onClick={onBackClick}
        />
        <h1 className={style.nickname}>{summary.nickname}</h1>
      </header>
      <p
        className={style.info}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: t('summaryInfoMessage', { url: `/#/help/contact-support/${propertyId}` }),
        }}
      />

      <Button
        postfix={<NextIcon />}
        variant="filled"
        value={t('editSurvey') as string}
        onClick={() => {
          history.push(`/settings/property-survey/${propertyId}`);
        }}
        size="big"
      />
      <section className={style.section}>
        <h2 className={style.sectionHeader}>{t('propertyDetails')}</h2>
        <div className={style.row}>
          <div className={classNames(style.col, style.fill)}>
            <h3>{t('fullAddressOfProperty')}</h3>
            <span>{summary.address_2 || summary.address || '-'}</span>
          </div>
        </div>
        <div className={style.row}>
          <div className={style.col}>
            <h3>{t('parkingNumber')}</h3>
            <span>{summary.parkingNumber || '-'}</span>
          </div>
          <div className={style.col}>
            <h3>{t('detPermit')}</h3>
            <span>{summary.permit || '-'}</span>
          </div>
          <div className={style.col}>
            <h3>{t('wiFiName')}</h3>
            <span>{summary.wifiName || '-'}</span>
          </div>
          <div className={style.col}>
            <h3>{t('wiFiPassword')}</h3>
            <span>{summary.wifiPass || '-'}</span>
          </div>
        </div>
      </section>
      <section className={style.section}>
        <h2 className={style.sectionHeader}>{t('form:utilitiesDetails')}</h2>
        <div className={style.row}>
          <div className={style.col}>
            <h3>{t('du')}</h3>
            <span>{summary.du || '-'}</span>
          </div>
          <div className={style.col}>
            <h3>{t('dewa')}</h3>
            <span>{summary.dewa || '-'}</span>
          </div>
        </div>
      </section>
      <section className={style.section}>
        <h2 className={style.sectionHeader}>{t('form:bankDetails')}</h2>
        <div className={style.row}>
          <div className={classNames(style.col, style.col40, style.mobileSingle)}>
            <h3>{t('accountName')}</h3>
            <span>{summary.bankData.accountName || '-'}</span>
          </div>
          <div className={classNames(style.col, style.col40, style.mobileSingle)}>
            <h3>{t('bankName')}</h3>
            <span>{summary.bankData.bankName || '-'}</span>
          </div>
        </div>
        <div className={style.row}>
          <div className={classNames(style.col, style.fill)}>
            <h3>{t('iban')}</h3>
            <span>{summary.bankData.iban || '-'}</span>
          </div>
        </div>
        <div className={style.row}>
          <div className={classNames(style.col, style.fill)}>
            <h3>{t('accountNo')}</h3>
            <span>{summary.bankData.accountNumber || '-'}</span>
          </div>
        </div>
        <div className={style.row}>
          <div className={classNames(style.col, style.fill)}>
            <h3>{t('swiftCode')}</h3>
            <span>{summary.bankData.swift || '-'}</span>
          </div>
        </div>
      </section>

      <Button
        postfix={<NextIcon />}
        variant="outline"
        className={style.bankButton}
        value={t('editInBankDetails') as string}
        size="big"
        onClick={() => {
          history.push(`/settings/property-survey/${propertyId}/2`);
        }}
      />
    </div>
  );
};

export default PropertySummary;
