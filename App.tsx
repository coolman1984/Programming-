
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ArticlePage from './pages/ArticlePage';
import AnalysisReportPage from './pages/AnalysisReportPage';
import { AnalysisProvider } from './context/AnalysisContext';
import { LanguageProvider } from './context/LanguageContext';

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AnalysisProvider>
        <HashRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/article/:id" element={<ArticlePage />} />
              <Route path="/report" element={<AnalysisReportPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </HashRouter>
      </AnalysisProvider>
    </LanguageProvider>
  );
};

export default App;
