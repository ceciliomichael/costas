import React, { useState } from 'react';
import '../styles/Gallery.css';

// Import gallery images
import gallery1 from '../assets/images/gallery1.png';
import gallery2 from '../assets/images/gallery2.jpg';
import gallery3 from '../assets/images/gallery3.jpg';
import gallery4 from '../assets/images/gallery4.jpg';
import gallery5 from '../assets/images/gallery5.jpg';
import gallery6 from '../assets/images/gallery6.jpg';

interface ImageModal {
  url: string;
  title: string;
}

const Gallery: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<ImageModal | null>(null);

  const images = [
    {
      url: gallery1,
      title: 'Costas de Liwa Resort Entrance'
    },
    {
      url: gallery2,
      title: 'A-Frame Tepee Exterior'
    },
    {
      url: gallery3,
      title: 'Tepee Interior with Loft'
    },
    {
      url: gallery4,
      title: 'Night View with Pool'
    },
    {
      url: gallery5,
      title: 'A-Frame Tepee and Relaxation Area'
    },
    {
      url: gallery6,
      title: 'Beach Cabana and Lounge'
    }
  ];

  return (
    <section className="gallery section-cream" id="gallery">
      <div className="container">
        <h2 className="section-title fade-in">Gallery Section</h2>
        <div className="gallery-grid">
          {images.map((image, index) => (
            <div 
              key={index} 
              className="gallery-item fade-in"
              style={{ animationDelay: `${index * 0.2}s` }}
              onClick={() => setSelectedImage(image)}
            >
              <div className="gallery-image">
                <img src={image.url} alt={image.title} />
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
              src={selectedImage.url}
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