import React, { useState, useEffect } from 'react';
import '../styles/Navbar.css';

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

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
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <a href="#" className="navbar-logo" onClick={(e) => {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}>
          Costas Resort
        </a>
        <div className="nav-links">
          <a href="#gallery" className="nav-link" onClick={(e) => {
            e.preventDefault();
            scrollToSection('gallery');
          }}>Gallery</a>
          <a href="#book" className="nav-link" onClick={(e) => {
            e.preventDefault();
            scrollToSection('book');
          }}>Book</a>
          <a href="#about" className="nav-link" onClick={(e) => {
            e.preventDefault();
            scrollToSection('about');
          }}>About</a>
          <a href="#contact" className="nav-link" onClick={(e) => {
            e.preventDefault();
            scrollToSection('contact');
          }}>Contact</a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 