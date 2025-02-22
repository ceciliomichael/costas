import React, { useEffect, useState } from 'react';
import '../styles/LoadingDialog.css';

interface LoadingDialogProps {
  message?: string;
  duration?: number;
  onComplete?: () => void;
}

const LoadingDialog: React.FC<LoadingDialogProps> = ({ 
  message = 'Taking you to booking...',
  duration,
  onComplete
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration && onComplete) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onComplete, 300); // Wait for fade out animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="loading-dialog">
      <div className="loading-content">
        <div className="loading-spinner"></div>
        <div className="loading-message">
          <p>{message}</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingDialog; 