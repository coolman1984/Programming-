
import React, { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import { AnalysisProvider } from './context/AnalysisContext';
import { LanguageProvider } from './context/LanguageContext';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const ArticlePage = lazy(() => import('./pages/ArticlePage'));
const AnalysisReportPage = lazy(() => import('./pages/AnalysisReportPage'));
const Analysis = lazy(() => import('./pages/Analysis'));

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AnalysisProvider>
          <HashRouter>
            <Layout>
              <ErrorBoundary>
                <Suspense fallback={<div>Loading...</div>}>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/analysis" element={<Analysis />} />
                    <Route path="/article/:id" element={<ArticlePage />} />
                    <Route path="/report" element={<AnalysisReportPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </Layout>
          </HashRouter>
        </AnalysisProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
};

export default App;
