import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Booking from './pages/Booking';
import ErrorPage from './components/ErrorPage';
import LoadingDialog from './components/LoadingDialog';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ChatBot from './components/ChatBot';
import './styles/App.css';

const AppRoutes: React.FC = () => {
  const location = useLocation();
  const showChatBot = location.pathname === '/' || location.pathname === '/booking';

  return (
    <> 
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/error/500" element={<ErrorPage code="500" />} />
        <Route path="/404" element={<ErrorPage code="404" />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
      {showChatBot && <ChatBot />}
    </>
  );
};

const App: React.FC = () => {
  useEffect(() => {
    // Clear all browser storage
    sessionStorage.clear();

    // Force reload assets by appending timestamp to URLs
    const links = document.querySelectorAll('link');
    const scripts = document.querySelectorAll('script');

    links.forEach(link => {
      if (link.href && !link.href.includes('chrome-extension')) {
        link.href = appendTimestamp(link.href);
      }
    });

    scripts.forEach(script => {
      if (script.src && !script.src.includes('chrome-extension')) {
        script.src = appendTimestamp(script.src);
      }
    });

    // Set cache control headers
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
  }, []);

  // Helper function to append timestamp to URLs
  const appendTimestamp = (url: string): string => {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}t=${new Date().getTime()}`;
  };

  return (
    <Router>
      <Suspense fallback={<LoadingDialog message="Loading..." />}> 
        <AppRoutes />
      </Suspense>
    </Router>
  );
};

export default App;
