import React, { Suspense } from 'react';
import { AppFooter } from '@coreui/react';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

const Footer = ({ loading }) => {
  const { t } = useTranslation('common');

  return (
    <AppFooter>
      <Suspense fallback={loading}>
        <span
          dangerouslySetInnerHTML={{
            __html: t('copyrights', { year: moment().format('YYYY') }),
          }}
        />
      </Suspense>
    </AppFooter>
  );
};

export default Footer;
