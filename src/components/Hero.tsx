import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Hero.css';
import heroImage from '../assets/images/hero.jpg';
import LoadingDialog from './LoadingDialog';

const Hero: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleBooking = () => {
    setIsLoading(true);
    // Simulate a small delay for the loading animation
    setTimeout(() => {
      navigate('/booking', { 
        state: { 
          selectedRoomId: 'couple-tepee', // Default to couple tepee when booking from hero
          selectedRoomType: 'Couple Tepee'
        } 
      });
    }, 1500);
  };

  return (
    <>
      {isLoading && <LoadingDialog />}
      <div id="hero" className="hero" style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${heroImage})` }}>
        <div className="hero-content">
          <h1>Welcome to<br />Costas De Liwa</h1>
          <p>Experience a unique coastal escape where rustic charm meets modern comfort</p>
          <button 
            className="cta-button"
            onClick={handleBooking}
            aria-label="Book your stay at Costas De Liwa"
          >
            Book Your Stay
          </button>
        </div>
      </div>
    </>
  );
};

export default Hero; 