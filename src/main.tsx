import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppRouter } from './app/AppRouter';
import { I18nProvider } from './shared/i18n/I18nProvider';
import { ThemeProvider } from './shared/theme/ThemeProvider';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <I18nProvider>
        <AppRouter />
      </I18nProvider>
    </ThemeProvider>
  </React.StrictMode>
);

