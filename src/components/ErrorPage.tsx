import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ErrorPage.css';

interface ErrorPageProps {
  code?: '404' | '500';
}

const ErrorPage: React.FC<ErrorPageProps> = ({ code = '404' }) => {
  const navigate = useNavigate();

  const errorContent = {
    '404': {
      title: 'Page Not Found',
      message: 'Oops! The page you are looking for does not exist.',
      icon: '🔍'
    },
    '500': {
      title: 'Server Error',
      message: 'Oops! Something went wrong on our end.',
      icon: '🛠️'
    }
  };

  const { title, message, icon } = errorContent[code];

  return (
    <div className="error-page">
      <div className="error-content">
        <div className="error-icon">{icon}</div>
        <h1>{code}</h1>
        <h2>{title}</h2>
        <p>{message}</p>
        <button 
          className="return-button"
          onClick={() => navigate('/')}
        >
          Return to Home
        </button>
      </div>
    </div>
  );
};

export default ErrorPage; 