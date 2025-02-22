import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Rooms.css';
import LoadingDialog from './LoadingDialog';

import coupleTepee from '../assets/images/couple-tepee.jpg';
import standardTepee from '../assets/images/standard-tepee.jpg';
import deluxeTepee from '../assets/images/deluxe-tepee.jpg';

const Rooms: React.FC = () => {
  const navigate = useNavigate();
  const [loadingRoom, setLoadingRoom] = useState<string | null>(null);

  const handleBooking = (roomId: string, roomType: string) => {
    setLoadingRoom(roomType);
    // Simulate a small delay for the loading animation
    setTimeout(() => {
      navigate('/booking', { 
        state: { 
          selectedRoomId: roomId,
          selectedRoomType: roomType
        } 
      });
    }, 1500);
  };

  const rooms = [
    {
      id: 'couple-tepee',
      type: 'Couple Tepee',
      image: coupleTepee,
      description: 'Cozy tepee with a double bed, perfect for couples or solo travelers seeking a unique experience. Features air conditioning and Wi-Fi.',
      price: 'From ₱2,499/night',
      buttonText: 'Book Your Escape',
      details: 'Weekday: ₱2,499 | Weekend: ₱2,999'
    },
    {
      id: 'standard-tepee',
      type: 'Standard Tepee',
      image: standardTepee,
      description: 'Mid-tier tepee with double bed, single pull-out bed, and loft area. Ideal for small families or friend groups.',
      price: 'From ₱4,499/night',
      buttonText: 'Book Your Stay',
      details: 'Weekday: ₱4,499 | Weekend: ₱4,999'
    },
    {
      id: 'deluxe-tepee',
      type: 'Deluxe Tepee',
      image: deluxeTepee,
      description: 'Our largest tepee featuring a queen-size loft bed, single bed, and double bed. Perfect for larger groups up to 7 guests.',
      price: 'From ₱6,999/night',
      buttonText: 'Book Your Style',
      details: 'Weekday: ₱6,999 | Weekend: ₱7,499'
    }
  ];

  return (
    <>
      {loadingRoom && (
        <LoadingDialog message={`Preparing your ${loadingRoom} booking experience...`} />
      )}
      <section className="rooms section-cream" id="book">
        <div className="container">
          <h2 className="section-title">Choose Your Perfect Stay</h2>
          <div className="rooms-container">
            {rooms.map((room, index) => (
              <div 
                key={room.id} 
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
                  <p className="room-details">{room.details}</p>
                  <button 
                    className={`btn btn-primary room-button ${loadingRoom === room.type ? 'loading' : ''}`}
                    onClick={() => handleBooking(room.id, room.type)}
                    disabled={loadingRoom !== null}
                  >
                    {room.buttonText}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Rooms; 