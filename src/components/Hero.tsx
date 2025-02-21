import React from 'react';
import '../styles/Hero.css';
import heroImage from '../assets/images/hero.jpg';

const Hero: React.FC = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // Height of the fixed navbar
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="hero" style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${heroImage})` }}>
      <div className="hero-content">
        <h1>Welcome to<br />Costas Resort</h1>
        <p>Experience Serenity in Luxury</p>
        <button 
          className="cta-button"
          onClick={() => scrollToSection('book')}
          aria-label="Book your stay at Costas Resort"
        >
          Book Your Stay
        </button>
      </div>
    </div>
  );
};

export default Hero; 