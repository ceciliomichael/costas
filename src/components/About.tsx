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
              Nestled in the heart of Liwa's stunning landscape, Costas de Liwa offers a unique blend 
              of luxury and nature. Our tepee-style accommodations provide an unforgettable glamping 
              experience that connects you with nature while enjoying modern comforts.
            </p>
            <p className="about-description">
              Each of our carefully designed tepees offers a perfect escape from the busy city life, 
              allowing you to immerse yourself in the tranquility of nature without compromising on comfort.
            </p>
          </div>
          <div className="about-features">
            <div className="feature-card fade-in" style={{ animationDelay: '0.2s' }}>
              <i className="feature-icon">🌿</i>
              <h3>Eco-Friendly</h3>
              <p>Sustainable practices and natural materials</p>
            </div>
            <div className="feature-card fade-in" style={{ animationDelay: '0.4s' }}>
              <i className="feature-icon">✨</i>
              <h3>Luxury Comfort</h3>
              <p>Modern amenities in natural settings</p>
            </div>
            <div className="feature-card fade-in" style={{ animationDelay: '0.6s' }}>
              <i className="feature-icon">🌅</i>
              <h3>Scenic Views</h3>
              <p>Breathtaking landscapes and sunsets</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About; 