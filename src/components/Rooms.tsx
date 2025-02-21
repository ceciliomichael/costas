import React from 'react';
import '../styles/Rooms.css';

import coupleTepee from '../assets/images/couple-tepee.jpg';
import standardTepee from '../assets/images/standard-tepee.jpg';
import deluxeTepee from '../assets/images/deluxe-tepee.jpg';

const Rooms: React.FC = () => {
  const rooms = [
    {
      type: 'Couple Tepee',
      image: coupleTepee,
      description: 'Perfect for romantic getaways',
      price: '₱2,999/night',
      buttonText: 'Book Your Escape'
    },
    {
      type: 'Standard Tepee',
      image: standardTepee,
      description: 'Ideal for small families or friends',
      price: '₱3,999/night',
      buttonText: 'Book Your Stay'
    },
    {
      type: 'Deluxe Tepee',
      image: deluxeTepee,
      description: 'Luxury camping experience',
      price: '₱4,999/night',
      buttonText: 'Book Your Style'
    }
  ];

  return (
    <section className="rooms section-cream" id="book">
      <div className="container">
        <h2 className="section-title">Choose Your Perfect Stay</h2>
        <div className="rooms-container">
          {rooms.map((room, index) => (
            <div 
              key={index} 
              className="room-card fade-in"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="room-image">
                <img src={`${room.image}?auto=format&fit=crop&w=800&q=80`} alt={room.type} />
              </div>
              <div className="room-content">
                <h3>{room.type}</h3>
                <p className="room-description">{room.description}</p>
                <p className="room-price">{room.price}</p>
                <button className="btn btn-primary room-button">
                  {room.buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Rooms; 