import React, { useState } from 'react';
import '../styles/Contact.css';

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

const Contact: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    success?: boolean;
    message?: string;
  }>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Name cannot exceed 100 characters';
    }
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    } else if (formData.email.length > 100) {
      newErrors.email = 'Email cannot exceed 100 characters';
    }
    
    // Subject validation
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    } else if (formData.subject.length > 200) {
      newErrors.subject = 'Subject cannot exceed 200 characters';
    }
    
    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.length > 2000) {
      newErrors.message = 'Message cannot exceed 2000 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset status
    setSubmitStatus({});
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('https://costasbackend.ultrawavelet.me/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSubmitStatus({
          success: true,
          message: 'Your message has been sent successfully! We will get back to you soon.'
        });
        
        // Reset form on success
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      } else {
        setSubmitStatus({
          success: false,
          message: data.message || 'Failed to send message. Please try again later.'
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setSubmitStatus({
        success: false,
        message: 'An error occurred while sending your message. Please try again later.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
          
          <form className="contact-form fade-in" onSubmit={handleSubmit}>
            {submitStatus.message && (
              <div className={`form-status ${submitStatus.success ? 'success' : 'error'}`}>
                {submitStatus.message}
              </div>
            )}
            
            <div className="form-group">
              <input 
                type="text" 
                name="name"
                placeholder="Your Name" 
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <div className="error-message">{errors.name}</div>}
            </div>
            
            <div className="form-group">
              <input 
                type="email" 
                name="email"
                placeholder="Your Email" 
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <div className="error-message">{errors.email}</div>}
            </div>
            
            <div className="form-group">
              <input 
                type="text" 
                name="subject"
                placeholder="Subject" 
                value={formData.subject}
                onChange={handleChange}
                className={errors.subject ? 'error' : ''}
              />
              {errors.subject && <div className="error-message">{errors.subject}</div>}
            </div>
            
            <div className="form-group">
              <textarea 
                name="message"
                placeholder="Your Message" 
                rows={5} 
                value={formData.message}
                onChange={handleChange}
                className={errors.message ? 'error' : ''}
              ></textarea>
              {errors.message && <div className="error-message">{errors.message}</div>}
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact; 