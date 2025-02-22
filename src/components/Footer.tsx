import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.css';

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log('Subscribed:', email);
    setEmail('');
    // Add actual newsletter subscription logic here
  };

  const handleQuickLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <footer className="footer">
      <div className="footer-content container">
        <div className="footer-section">
          <h3>Costas De Liwa</h3>
          <p className="footer-description">
            Experience unique coastal living in our modern tepee accommodations. 
            Where comfort meets adventure in the heart of Zambales.
          </p>
          <div className="social-links">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <i className="social-icon">📘</i>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <i className="social-icon">📸</i>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <i className="social-icon">🐦</i>
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul className="footer-links">
            <li><a href="#" onClick={(e) => handleQuickLinkClick(e, 'hero')}>Home</a></li>
            <li><a href="#about" onClick={(e) => handleQuickLinkClick(e, 'about')}>About Us</a></li>
            <li><a href="#book" onClick={(e) => handleQuickLinkClick(e, 'book')}>Book Now</a></li>
            <li><a href="#contact" onClick={(e) => handleQuickLinkClick(e, 'contact')}>Contact</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Contact Info</h3>
          <ul className="contact-info">
            <li>
              <i className="contact-icon">📍</i>
              Liwliwa, San Felipe, Zambales
            </li>
            <li>
              <i className="contact-icon">📞</i>
              +63 912 345 6789
            </li>
            <li>
              <i className="contact-icon">✉️</i>
              info@costasdeliwa.com
            </li>
            <li>
              <i className="contact-icon">⏰</i>
              Check-in: 2:00 PM
            </li>
            <li>
              <i className="contact-icon">⌛</i>
              Check-out: 12:00 PM
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Newsletter</h3>
          <p>Subscribe to receive updates and special offers</p>
          <form onSubmit={handleSubscribe} className="newsletter-form">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="btn-subscribe">Subscribe</button>
          </form>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} Costas De Liwa. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cancellation Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 