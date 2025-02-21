import React, { useState } from 'react';
import '../styles/Gallery.css';

interface ImageModal {
  url: string;
  title: string;
}

const Gallery: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<ImageModal | null>(null);

  const images = [
    {
      url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b',
      title: 'Luxury Suite'
    },
    {
      url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d',
      title: 'Infinity Pool'
    },
    {
      url: 'https://images.unsplash.com/photo-1615880484746-a134be9a6ecf',
      title: 'Beach View'
    },
    {
      url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
      title: 'Resort Entrance'
    },
    {
      url: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa',
      title: 'Fine Dining'
    },
    {
      url: 'https://images.unsplash.com/photo-1540541338287-41700207dee6',
      title: 'Spa Treatment'
    }
  ];

  return (
    <section className="gallery section-cream" id="gallery">
      <div className="container">
        <h2 className="section-title fade-in">Explore Our Paradise</h2>
        <div className="gallery-grid">
          {images.map((image, index) => (
            <div 
              key={index} 
              className="gallery-item fade-in"
              style={{ animationDelay: `${index * 0.2}s` }}
              onClick={() => setSelectedImage(image)}
            >
              <div className="gallery-image">
                <img src={`${image.url}?auto=format&fit=crop&w=800&q=80`} alt={image.title} />
                <div className="gallery-overlay">
                  <h3>{image.title}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="modal-overlay" onClick={() => setSelectedImage(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button 
              className="modal-close" 
              onClick={() => setSelectedImage(null)}
              aria-label="Close image"
            >
              ×
            </button>
            <img 
              src={`${selectedImage.url}?auto=format&fit=crop&w=1600&q=100`} 
              alt={selectedImage.title} 
            />
            <h3 className="modal-title">{selectedImage.title}</h3>
          </div>
        </div>
      )}
    </section>
  );
};

export default Gallery; 