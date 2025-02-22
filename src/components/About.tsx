import React from 'react';
import '../styles/About.css';

const About: React.FC = () => {
  return (
    <section className="about section-dark" id="about">
      <div className="container">
        <div className="about-content">
          <div className="about-text fade-in">
            <h2 className="section-title">About Costas de Liwa</h2>
            <p className="about-description">
              Nestled in the serene community of Liwliwa in San Felipe, Zambales, Costas de Liwa offers a unique blend 
              of budget-friendly coastal living and modern comfort. Our resort combines the natural beauty of the 
              Philippine coast with innovative tepee-style accommodations, creating an unforgettable glamping experience.
            </p>
            <p className="about-description">
              Just a short 5-minute walk from Liwliwa Beach, our resort provides a peaceful retreat where you can 
              enjoy the coastal ambiance while maintaining a comfortable distance from the crowds. We pride ourselves 
              on offering cost-effective accommodations without compromising on essential amenities.
            </p>
          </div>
          <div className="about-features">
            <div className="feature-card fade-in" style={{ animationDelay: '0.2s' }}>
              <i className="feature-icon">🏊‍♂️</i>
              <h3>Swimming Pool</h3>
              <p>Refreshing outdoor pool for guests</p>
            </div>
            <div className="feature-card fade-in" style={{ animationDelay: '0.4s' }}>
              <i className="feature-icon">🍽️</i>
              <h3>Restaurant & Bar</h3>
              <p>On-site dining with local and international cuisine</p>
            </div>
            <div className="feature-card fade-in" style={{ animationDelay: '0.6s' }}>
              <i className="feature-icon">🌅</i>
              <h3>Beach Access</h3>
              <p>5-minute walk to Liwliwa Beach</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About; 