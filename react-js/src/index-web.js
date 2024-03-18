import React from 'react';
import ReactDOM from 'react-dom';
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import App from './App';
import './i18n';
import './index.css';
import * as serviceWorker from './serviceWorker';
import environment from './environments/environment';

environment.isSentryEnabled &&
  Sentry.init({
    dsn: environment.sentryDsn,
    integrations: [new BrowserTracing()],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    tracesSampleRate: environment.sentrySampleRate,
  });

ReactDOM.render(<App />, document.getElementById('root'));

serviceWorker.unregister();
