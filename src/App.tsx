import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Booking from './pages/Booking';
import ErrorPage from './components/ErrorPage';
import LoadingDialog from './components/LoadingDialog';
import './styles/App.css';

const App: React.FC = () => {
  return (
    <Router>
      <Suspense fallback={<LoadingDialog message="Loading..." />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/error/500" element={<ErrorPage code="500" />} />
          <Route path="/404" element={<ErrorPage code="404" />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
