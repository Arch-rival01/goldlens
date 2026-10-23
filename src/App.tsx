import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/layout/ThemeContext';
import { ErrorBoundary } from './components/layout/ErrorBoundary';
import { AppLayout } from './components/layout/AppLayout';

// Pages
import { Overview } from './pages/Overview';
import { Spreads } from './pages/Spreads';
import { Prices } from './pages/Prices';
import { Curve } from './pages/Curve';
import { CalendarPage } from './pages/Calendar';
import { Backtest } from './pages/Backtest';
import { Alerts } from './pages/Alerts';
import { Health } from './pages/Health';
import { About } from './pages/About';
import { Glossary } from './pages/Glossary';
import { FAQ } from './pages/FAQ';
import { Plans } from './pages/Plans';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';
import { Disclaimer } from './pages/Disclaimer';
import { Notifications } from './pages/Notifications';
import { Settings } from './pages/Settings';
import { Welcome } from './pages/Welcome';
import { Admin } from './pages/Admin';
import { NotFound } from './pages/NotFound';
import { TradeHistory } from './pages/TradeHistory';

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Overview />} />
              <Route path="/spreads" element={<Spreads />} />
              <Route path="/prices" element={<Prices />} />
              <Route path="/trade-history" element={<TradeHistory />} />
              <Route path="/curve" element={<Curve />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/backtest" element={<Backtest />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/health" element={<Health />} />
              <Route path="/about" element={<About />} />
              <Route path="/glossary" element={<Glossary />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/plans" element={<Plans />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/disclaimer" element={<Disclaimer />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/signin" element={<Navigate to="/" replace />} />
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
