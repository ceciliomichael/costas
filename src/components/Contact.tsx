import React from 'react';
import '../styles/Contact.css';

const Contact: React.FC = () => {
  return (
    <section className="contact" id="contact">
      <div className="container">
        <div className="contact-content">
          <div className="contact-info fade-in">
            <h2 className="section-title">Get in Touch</h2>
            <div className="contact-details">
              <div className="contact-item">
                <i className="contact-icon">📍</i>
                <div>
                  <h3>Location</h3>
                  <p>Liwliwa, San Felipe, Zambales</p>
                </div>
              </div>
              <div className="contact-item">
                <i className="contact-icon">📞</i>
                <div>
                  <h3>Phone</h3>
                  <p>+63 912 345 6789</p>
                </div>
              </div>
              <div className="contact-item">
                <i className="contact-icon">✉️</i>
                <div>
                  <h3>Email</h3>
                  <p>info@costasdeliwa.com</p>
                </div>
              </div>
            </div>
          </div>
          <form className="contact-form fade-in">
            <div className="form-group">
              <input type="text" placeholder="Your Name" required />
            </div>
            <div className="form-group">
              <input type="email" placeholder="Your Email" required />
            </div>
            <div className="form-group">
              <input type="text" placeholder="Subject" required />
            </div>
            <div className="form-group">
              <textarea placeholder="Your Message" rows={5} required></textarea>
            </div>
            <button type="submit" className="btn btn-primary">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact; 