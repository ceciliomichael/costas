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
      url: 'https://placehold.co/800x600/e2e8f0/1e293b?text=Placeholder+Image+1',
      title: 'Placeholder Image 1'
    },
    {
      url: 'https://placehold.co/800x600/e2e8f0/1e293b?text=Placeholder+Image+2',
      title: 'Placeholder Image 2'
    },
    {
      url: 'https://placehold.co/800x600/e2e8f0/1e293b?text=Placeholder+Image+3',
      title: 'Placeholder Image 3'
    },
    {
      url: 'https://placehold.co/800x600/e2e8f0/1e293b?text=Placeholder+Image+4',
      title: 'Placeholder Image 4'
    },
    {
      url: 'https://placehold.co/800x600/e2e8f0/1e293b?text=Placeholder+Image+5',
      title: 'Placeholder Image 5'
    },
    {
      url: 'https://placehold.co/800x600/e2e8f0/1e293b?text=Placeholder+Image+6',
      title: 'Placeholder Image 6'
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