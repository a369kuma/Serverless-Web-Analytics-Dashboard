import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnalyticsProvider } from './contexts/AnalyticsContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import SiteDetails from './pages/SiteDetails';
import AddSite from './pages/AddSite';
import Sites from './pages/Sites';

function App() {
  return (
    <AnalyticsProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/sites" element={<Sites />} />
            <Route path="/sites/add" element={<AddSite />} />
            <Route path="/sites/:siteId" element={<SiteDetails />} />
          </Routes>
        </Layout>
      </Router>
    </AnalyticsProvider>
  );
}

export default App;
