import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/booking.css';
import gcashQR from '../assets/images/gcash-qr.jpg';
import LoadingDialog from '../components/LoadingDialog';

import coupleTepee from '../assets/images/couple-tepee.jpg';
import standardTepee from '../assets/images/standard-tepee.jpg';
import deluxeTepee from '../assets/images/deluxe-tepee.jpg';

interface Room {
  id: string;
  type: string;
  description: string;
  capacity: string;
  price: {
    weekday: number;
    weekend: number;
  };
  amenities: string[];
  image: string;
  bathType: string;
}

interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
}

interface TotalCalculation {
  total: number;
  roomTotal: number;
  addOnsTotal: number;
  nights: number;
}

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface CardType {
  name: string;
  pattern: RegExp;
  icon: string;
}

const rooms: Room[] = [
  {
    id: 'couple-tepee',
    type: 'Couple Tepee',
    description: 'Cozy tepee with a double bed, perfect for couples or solo travelers seeking a unique experience.',
    capacity: 'Up to 2 guests',
    price: {
      weekday: 2499,
      weekend: 2999
    },
    amenities: ['Air conditioning', 'Wi-Fi', 'Shared bathroom'],
    image: coupleTepee,
    bathType: 'Shared'
  },
  {
    id: 'standard-tepee',
    type: 'Standard Tepee',
    description: 'Mid-tier tepee with 1 double bed, 1 single pull-out bed, and a loft area. Ideal for small families or friend groups.',
    capacity: 'Up to 4 guests',
    price: {
      weekday: 4499,
      weekend: 4999
    },
    amenities: ['Air conditioning', 'Wi-Fi', 'Shared bathroom'],
    image: standardTepee,
    bathType: 'Shared'
  },
  {
    id: 'deluxe-tepee',
    type: 'Deluxe Tepee',
    description: 'Our largest tepee with 1 queen-size loft bed, 1 single bed, and 1 double bed. Perfect for larger groups wanting a unique glamping experience.',
    capacity: 'Up to 7 guests',
    price: {
      weekday: 6999,
      weekend: 7499
    },
    amenities: ['Air conditioning', 'Private bathroom', 'Wi-Fi', 'TV'],
    image: deluxeTepee,
    bathType: 'Private'
  }
];

const addOns: AddOn[] = [
  {
    id: 'early-checkin',
    name: 'Early Check-in',
    description: 'Check-in as early as 10:00 AM (subject to availability)',
    price: 500,
    category: 'Check-in Options'
  },
  {
    id: 'late-checkout',
    name: 'Late Check-out',
    description: 'Check-out as late as 4:00 PM (subject to availability)',
    price: 500,
    category: 'Check-in Options'
  },
  {
    id: 'breakfast',
    name: 'Breakfast Package',
    description: 'Daily breakfast from our on-site restaurant',
    price: 350,
    category: 'Dining'
  },
  {
    id: 'fullboard',
    name: 'Full Board Package',
    description: 'Daily breakfast, lunch, and dinner',
    price: 1200,
    category: 'Dining'
  },
  {
    id: 'pet-fee',
    name: 'Pet Fee',
    description: 'Bring your furry friend along (size restrictions apply)',
    price: 500,
    category: 'Additional Services'
  }
];

const paymentMethods: PaymentMethod[] = [
  {
    id: 'credit-card',
    name: 'Credit/Debit Card',
    description: 'Pay securely with your card',
    icon: '💳'
  },
  {
    id: 'gcash',
    name: 'GCash',
    description: 'Pay using GCash QR',
    icon: '📱'
  },
  {
    id: 'bank-transfer',
    name: 'Bank Transfer',
    description: 'Direct bank transfer to our account',
    icon: '🏦'
  }
];

const cardTypes: CardType[] = [
  { name: 'visa', pattern: /^4/, icon: '💳' },
  { name: 'mastercard', pattern: /^5[1-5]/, icon: '💳' },
  { name: 'amex', pattern: /^3[47]/, icon: '💳' },
  { name: 'discover', pattern: /^6(?:011|5)/, icon: '💳' },
];

const getCardType = (number: string): CardType | undefined => {
  return cardTypes.find(card => card.pattern.test(number));
};

const Booking: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedRoomId } = location.state || {};
  const [currentPhase, setCurrentPhase] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [dates, setDates] = useState({ checkIn: '', checkOut: '' });
  const [guests, setGuests] = useState({ adults: 1, children: 0 });
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [validationError, setValidationError] = useState<string>('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    paymentProof: null as File | null,
    senderName: '',
    senderBank: '',
    referenceNumber: '',
    dateOfTransfer: ''
  });
  const [bookingReference, setBookingReference] = useState<string>('');
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);
  const [isReturningHome, setIsReturningHome] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const [cardType, setCardType] = useState<CardType | undefined>();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isPaymentConfigured, setIsPaymentConfigured] = useState(false);
  const [tempPaymentMethod, setTempPaymentMethod] = useState<string>('');
  const [paymentValidationError, setPaymentValidationError] = useState<string>('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);
  const [isFinalizingBooking, setIsFinalizingBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string>('');
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [guestInfo, setGuestInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  const phases = [
    'Room Selection',
    'Guest Details',
    'Add-ons',
    'Review',
    'Payment',
    'Confirmation'
  ];

  const getTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getMinCheckoutDate = () => {
    if (!dates.checkIn) return getTomorrow();
    const checkOut = new Date(dates.checkIn);
    checkOut.setDate(checkOut.getDate() + 1);
    return checkOut.toISOString().split('T')[0];
  };

  const isWeekend = (date: string) => {
    const day = new Date(date).getDay();
    return day === 5 || day === 6 || day === 0; // Friday, Saturday, Sunday
  };

  const calculateTotal = (): TotalCalculation => {
    if (!selectedRoom || !dates.checkIn || !dates.checkOut) {
      return {
        total: 0,
        roomTotal: 0,
        addOnsTotal: 0,
        nights: 0
      };
    }
    
    const start = new Date(dates.checkIn);
    const end = new Date(dates.checkOut);
    let total = 0;
    let roomTotal = 0;
    let addOnsTotal = 0;
    
    // Calculate number of nights
    const nights = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculate room cost per night based on weekday/weekend rates
    for (let date = new Date(start); date < end; date.setDate(date.getDate() + 1)) {
      const nightRate = isWeekend(date.toISOString()) ? selectedRoom.price.weekend : selectedRoom.price.weekday;
      roomTotal += nightRate;
    }
    total += roomTotal;

    // Add selected add-ons
    const totalGuests = guests.adults + guests.children;
    selectedAddOns.forEach(addOnId => {
      const addOn = addOns.find(a => a.id === addOnId);
      if (addOn) {
        if (addOn.id === 'breakfast') {
          // Breakfast is per person, per night
          addOnsTotal += addOn.price * nights * totalGuests;
        } else if (addOn.id === 'fullboard') {
          // Full board is per person, per night
          addOnsTotal += addOn.price * nights * totalGuests;
        } else {
          // One-time charges
          addOnsTotal += addOn.price;
        }
      }
    });
    total += addOnsTotal;

    return { total, roomTotal, addOnsTotal, nights };
  };

  const validatePhase = () => {
    setValidationError('');
    
    switch (currentPhase) {
      case 0: // Room Selection
        if (!selectedRoom) {
          setValidationError('Please select a room to continue');
          return false;
        }
        return true;

      case 1: // Guest Details
        if (!dates.checkIn || !dates.checkOut) {
          setValidationError('Please select both check-in and check-out dates');
          return false;
        }

        if (!guestInfo.firstName.trim()) {
          setValidationError('Please enter your first name');
          return false;
        }

        if (!guestInfo.lastName.trim()) {
          setValidationError('Please enter your last name');
          return false;
        }

        if (!guestInfo.email.trim()) {
          setValidationError('Please enter your email');
          return false;
        }

        if (!guestInfo.phone.trim()) {
          setValidationError('Please enter your phone number');
          return false;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(guestInfo.email)) {
          setValidationError('Please enter a valid email address');
          return false;
        }

        // Basic phone validation (at least 10 digits)
        const phoneRegex = /^\+?[\d\s-]{10,}$/;
        if (!phoneRegex.test(guestInfo.phone.trim())) {
          setValidationError('Please enter a valid phone number (at least 10 digits)');
          return false;
        }

        const totalGuests = guests.adults + guests.children;
        const maxGuests = selectedRoom?.type === 'Deluxe Tepee' ? 7 
          : selectedRoom?.type === 'Standard Tepee' ? 4 
          : 2;

        if (totalGuests > maxGuests) {
          setValidationError(`This room type can only accommodate up to ${maxGuests} guests`);
          return false;
        }

        if (guests.adults < 1) {
          setValidationError('At least one adult is required');
          return false;
        }

        return true;

      default:
        return true;
    }
  };

  const handleNextPhase = () => {
    if (validatePhase()) {
      setCurrentPhase(currentPhase + 1);
    }
  };

  const generateBookingReference = () => {
    const prefix = 'REF';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setPaymentValidationError('File size must be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.match(/^image\/(jpeg|png|gif|jpg)$/)) {
        setPaymentValidationError('Only image files (JPEG, PNG, GIF) are allowed');
        return;
      }

      setPaymentDetails(prev => ({
        ...prev,
        paymentProof: file
      }));
      setPaymentValidationError('');
    }
  };

  const saveBookingToDatabase = async (reference: string) => {
    try {
      // Create form data to send file
      const formData = new FormData();

      // Add all booking data
      const bookingData = {
        firstName: guestInfo.firstName,
        lastName: guestInfo.lastName,
        email: guestInfo.email,
        phoneNumber: guestInfo.phone,
        date: new Date(dates.checkIn).toISOString(),
        time: '14:00',
        numberOfGuests: guests.adults + guests.children,
        specialRequests: '',
        status: 'pending',
        roomType: selectedRoom?.type || '',
        checkInDate: new Date(dates.checkIn).toISOString(),
        checkOutDate: new Date(dates.checkOut).toISOString(),
        adults: guests.adults,
        children: guests.children,
        addOns: selectedAddOns.join(','),
        totalAmount: calculateTotal().total,
        paymentMethod: selectedPaymentMethod,
        paymentStatus: 'completed',
        bookingReference: reference
      };

      // Add all booking data fields to formData
      Object.entries(bookingData).forEach(([key, value]) => {
        formData.append(key, typeof value === 'string' ? value : JSON.stringify(value));
      });

      // Add payment proof file if exists
      if (paymentDetails.paymentProof) {
        formData.append('paymentProof', paymentDetails.paymentProof);
      }

      console.log('Sending booking data:', bookingData);

      const response = await fetch('https://costasbackend.ultrawavelet.me/api/bookings', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error details:', errorData);
        throw new Error(errorData.message || 'Failed to save booking');
      }

      const savedBooking = await response.json();
      console.log('Booking saved:', savedBooking);
      return true;
    } catch (error) {
      console.error('Error saving booking:', error);
      setBookingError('Failed to save booking. Please try again.');
      return false;
    }
  };

  const handlePaymentSubmit = async () => {
    if (!validatePaymentDetails()) {
      return;
    }

    if (selectedPaymentMethod === 'credit-card') {
      setShowDialog(true);
      setDialogMessage('Processing your credit card payment...');
      setIsProcessingPayment(true);

      // Simulate payment processing
      setTimeout(async () => {
        setDialogMessage('Payment successful! Processing your booking...');
        setIsProcessingPayment(false);
        setIsPaymentSuccess(true);

        // Simulate success confirmation duration
        setTimeout(async () => {
          setDialogMessage('Finalizing your booking...');
          setIsPaymentSuccess(false);
          setIsFinalizingBooking(true);

          // Generate reference first
          const reference = generateBookingReference();
          setBookingReference(reference);
          
          // Pass the reference to saveBookingToDatabase
          const bookingSaved = await saveBookingToDatabase(reference);
          
          if (bookingSaved) {
            setDialogMessage('Booking confirmed! Redirecting to confirmation...');
            setTimeout(() => {
              setShowDialog(false);
              setIsPaymentComplete(true);
              setCurrentPhase(5);
            }, 1500);
          } else {
            setDialogMessage('Failed to save booking. Please try again.');
            setTimeout(() => {
              setShowDialog(false);
              setValidationError('Failed to save booking. Please try again.');
            }, 2000);
          }
          setIsFinalizingBooking(false);
        }, 2000);
      }, 3000);
    } else {
      // For other payment methods (GCash, Bank Transfer)
      setShowDialog(true);
      setDialogMessage('Processing your booking...');
      setIsFinalizingBooking(true);

      setTimeout(async () => {
        setDialogMessage('Finalizing your booking...');
        
        const reference = generateBookingReference();
        setBookingReference(reference);
        
        const bookingSaved = await saveBookingToDatabase(reference);
        
        if (bookingSaved) {
          setDialogMessage('Booking confirmed! Redirecting to confirmation...');
          setTimeout(() => {
            setShowDialog(false);
            setIsPaymentComplete(true);
            setCurrentPhase(5);
          }, 1500);
        } else {
          setDialogMessage('Failed to save booking. Please try again.');
          setTimeout(() => {
            setShowDialog(false);
            setValidationError('Failed to save booking. Please try again.');
          }, 2000);
        }
        setIsFinalizingBooking(false);
      }, 2000);
    }
  };

  const handlePaymentMethodClick = (methodId: string) => {
    if (methodId === selectedPaymentMethod) {
      // If clicking the already selected method, deselect it and clear details
      setSelectedPaymentMethod('');
      setIsPaymentConfigured(false);
      setPaymentDetails({
        cardNumber: '',
        cardName: '',
        expiryDate: '',
        cvv: '',
        paymentProof: null,
        senderName: '',
        senderBank: '',
        referenceNumber: '',
        dateOfTransfer: ''
      });
      setPaymentValidationError('');
      setValidationError('');
    } else {
      // If selecting a new method, open modal for configuration
      setTempPaymentMethod(methodId);
      setIsPaymentModalOpen(true);
    }
  };

  const handleModalClose = (save: boolean) => {
    if (save) {
      setPaymentValidationError('');
      
      if (tempPaymentMethod === 'credit-card') {
        if (!paymentDetails.cardNumber || !paymentDetails.cardName || 
            !paymentDetails.expiryDate || !paymentDetails.cvv) {
          setPaymentValidationError('Please fill in all card details');
          return;
        }
        if (!/^\d{16}$/.test(paymentDetails.cardNumber.replace(/\s/g, ''))) {
          setPaymentValidationError('Invalid card number');
          return;
        }
      } else if (tempPaymentMethod === 'bank-transfer') {
        if (!paymentDetails.senderName || !paymentDetails.senderBank || 
            !paymentDetails.referenceNumber || !paymentDetails.dateOfTransfer) {
          setPaymentValidationError('Please fill in all transfer details');
          return;
        }
        if (!paymentDetails.paymentProof) {
          setPaymentValidationError('Please upload proof of payment');
          return;
        }
      } else if (tempPaymentMethod === 'gcash') {
        if (!paymentDetails.referenceNumber) {
          setPaymentValidationError('Please enter the GCash reference number');
          return;
        }
        if (!paymentDetails.paymentProof) {
          setPaymentValidationError('Please upload screenshot of payment');
          return;
        }
      }
      
      setSelectedPaymentMethod(tempPaymentMethod);
      setIsPaymentConfigured(true);
      setPaymentValidationError('');
      setValidationError('');
    }
    
    setIsPaymentModalOpen(false);
    setTempPaymentMethod('');
  };

  const validatePaymentDetails = () => {
    setValidationError('');
    if (!selectedPaymentMethod || !isPaymentConfigured) {
      setValidationError('Please configure a payment method');
      return false;
    }
    return true;
  };

  const handlePrint = () => {
    if (printRef.current) {
      window.print();
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatCardNumber(value);
    setCardType(getCardType(formatted.replace(/\s/g, '')));
    setPaymentDetails({ ...paymentDetails, cardNumber: formatted });
  };

  const handleBackToHome = () => {
    setIsReturningHome(true);
    setTimeout(() => {
      navigate('/');
    }, 1500);
  };

  useEffect(() => {
    if (selectedRoomId) {
      const room = rooms.find(r => r.id === selectedRoomId);
      if (room) {
        setSelectedRoom(room);
      }
    }
  }, [selectedRoomId]);

  const renderPhase = () => {
    switch (currentPhase) {
      case 0:
        return (
          <div className="room-selection">
            <h2>Select Your Room</h2>
            <p className="info-text">Note: Weekend rates (Fri-Sun) are slightly higher. All rooms include air conditioning and Wi-Fi.</p>
            <div className="rooms-grid">
              {rooms.map(room => (
                <div 
                  key={room.id} 
                  className={`room-card ${selectedRoom?.id === room.id ? 'selected' : ''}`}
                  onClick={() => setSelectedRoom(room)}
                >
                  <img src={room.image} alt={room.type} className="room-image" />
                  <div className="room-details">
                    <h3>{room.type}</h3>
                    <p>{room.description}</p>
                    <p className="capacity">{room.capacity}</p>
                    <div className="price-info">
                      <p className="weekday-price">Weekday: ₱{room.price.weekday.toLocaleString()}/night</p>
                      <p className="weekend-price">Weekend: ₱{room.price.weekend.toLocaleString()}/night</p>
                    </div>
                    <ul className="amenities">
                      {room.amenities.map((amenity, index) => (
                        <li key={index}>{amenity}</li>
                      ))}
                    </ul>
                    <p className="bath-type">{room.bathType} Bathroom</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="booking-policies">
              <h3>Important Policies</h3>
              <ul>
                <li>Check-in: 2:00 PM onwards</li>
                <li>Check-out: Before 12:00 PM</li>
                <li>Outside food and drinks are not permitted</li>
                <li>Pets are allowed with additional fee (restrictions apply)</li>
              </ul>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="dates-guests">
            <h2>Guest Information & Stay Details</h2>
            <div className="form-grid">
              <div className="guest-info">
                <div className="input-group">
                  <label htmlFor="firstName">First Name *</label>
                  <input
                    type="text"
                    id="firstName"
                    value={guestInfo.firstName}
                    onChange={(e) => setGuestInfo({ ...guestInfo, firstName: e.target.value })}
                    placeholder="Enter your first name"
                    required
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="lastName">Last Name *</label>
                  <input
                    type="text"
                    id="lastName"
                    value={guestInfo.lastName}
                    onChange={(e) => setGuestInfo({ ...guestInfo, lastName: e.target.value })}
                    placeholder="Enter your last name"
                    required
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    value={guestInfo.email}
                    onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    value={guestInfo.phone}
                    onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
              </div>
              <div className="date-inputs">
                <div className="input-group">
                  <label htmlFor="check-in">Check-in Date</label>
                  <input
                    type="date"
                    id="check-in"
                    value={dates.checkIn}
                    min={getTomorrow()}
                    onChange={(e) => {
                      const newCheckIn = e.target.value;
                      setDates(prev => {
                        const newDates = {
                          checkIn: newCheckIn,
                          checkOut: prev.checkOut && new Date(prev.checkOut) <= new Date(newCheckIn) 
                            ? '' 
                            : prev.checkOut
                        };
                        // Clear validation error if both dates are set
                        if (newDates.checkIn && newDates.checkOut) {
                          setValidationError('');
                        }
                        return newDates;
                      });
                    }}
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="check-out">Check-out Date</label>
                  <input
                    type="date"
                    id="check-out"
                    value={dates.checkOut}
                    min={getMinCheckoutDate()}
                    disabled={!dates.checkIn}
                    onChange={(e) => {
                      const newCheckOut = e.target.value;
                      setDates(prev => {
                        const newDates = { ...prev, checkOut: newCheckOut };
                        // Clear validation error if both dates are set
                        if (newDates.checkIn && newDates.checkOut) {
                          setValidationError('');
                        }
                        return newDates;
                      });
                    }}
                  />
                </div>
              </div>
              <div className="guest-inputs">
                <div className="input-group">
                  <label htmlFor="adults">Adults</label>
                  <div className="number-input">
                    <button onClick={() => setGuests({ ...guests, adults: Math.max(1, guests.adults - 1) })}>-</button>
                    <span>{guests.adults}</span>
                    <button onClick={() => setGuests({ ...guests, adults: guests.adults + 1 })}>+</button>
                  </div>
                </div>
                <div className="input-group">
                  <label htmlFor="children">Children</label>
                  <div className="number-input">
                    <button onClick={() => setGuests({ ...guests, children: Math.max(0, guests.children - 1) })}>-</button>
                    <span>{guests.children}</span>
                    <button onClick={() => setGuests({ ...guests, children: guests.children + 1 })}>+</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="add-ons">
            <h2>Customize Your Stay</h2>
            <div className="add-ons-grid">
              {Object.entries(addOns.reduce((acc, addOn) => ({
                ...acc,
                [addOn.category]: [...(acc[addOn.category] || []), addOn]
              }), {} as Record<string, AddOn[]>)).map(([category, categoryAddOns]) => (
                <div key={category} className="add-on-category">
                  <h3>{category}</h3>
                  <div className="add-on-items">
                    {categoryAddOns.map(addOn => (
                      <div 
                        key={addOn.id}
                        className={`add-on-card ${selectedAddOns.includes(addOn.id) ? 'selected' : ''}`}
                        onClick={() => {
                          setSelectedAddOns(prev => {
                            if (prev.includes(addOn.id)) {
                              // If clicking an already selected add-on, just remove it
                              return prev.filter(id => id !== addOn.id);
                            } else {
                              // If selecting a new add-on
                              let newSelection = [...prev];
                              
                              // If it's a dining add-on, remove any other dining add-ons
                              if (addOn.category === 'Dining') {
                                newSelection = newSelection.filter(id => 
                                  !addOns.find(a => a.id === id)?.category.includes('Dining')
                                );
                              }
                              
                              // Add the new selection
                              newSelection.push(addOn.id);
                              return newSelection;
                            }
                          });
                        }}
                      >
                        <div className="add-on-content">
                          <h4>{addOn.name}</h4>
                          <p>{addOn.description}</p>
                          <p className="add-on-price">₱{addOn.price.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="review">
            <h2>Review Your Booking</h2>
            {selectedRoom && (
              <div className="booking-summary">
                <div className="receipt-columns">
                  <div className="receipt-left">
                    <h3>Selected Room</h3>
                    <div className="receipt-row">
                      <span>Room Type</span>
                      <span>{selectedRoom.type}</span>
                    </div>
                    
                    <h3>Room Details</h3>
                    <div className="receipt-row">
                      <span>Weekday Rate</span>
                      <span>₱{selectedRoom.price.weekday.toLocaleString()}/night</span>
                    </div>
                    <div className="receipt-row">
                      <span>Weekend Rate</span>
                      <span>₱{selectedRoom.price.weekend.toLocaleString()}/night</span>
                    </div>
                    <div className="receipt-row">
                      <span>Number of Nights</span>
                      <span>{calculateTotal().nights}</span>
                    </div>
                    <div className="receipt-row subtotal">
                      <span>Room Total</span>
                      <span>₱{calculateTotal().roomTotal.toLocaleString()}</span>
                    </div>
                    
                    <h3>Stay Details</h3>
                    <div className="receipt-row">
                      <span>Check-in</span>
                      <span>{dates.checkIn}</span>
                    </div>
                    <div className="receipt-row">
                      <span>Check-out</span>
                      <span>{dates.checkOut}</span>
                    </div>
                  </div>

                  <div className="receipt-right">
                    <h3>Guest Information</h3>
                    <div className="receipt-row">
                      <span>Adults</span>
                      <span>{guests.adults}</span>
                    </div>
                    <div className="receipt-row">
                      <span>Children</span>
                      <span>{guests.children}</span>
                    </div>
                    
                    {selectedAddOns.length > 0 && (
                      <>
                        <h3>Add-ons</h3>
                        {selectedAddOns.map(addOnId => {
                          const addOn = addOns.find(a => a.id === addOnId);
                          return addOn && (
                            <div key={addOn.id} className="receipt-row">
                              <div>
                                <span>{addOn.name}</span>
                                <span className="add-on-detail">
                                  {(addOn.id === 'breakfast' || addOn.id === 'fullboard') 
                                    ? 'per person/night'
                                    : 'one-time fee'}
                                </span>
                              </div>
                              <span>₱{addOn.price.toLocaleString()}</span>
                            </div>
                          );
                        })}
                        <div className="receipt-row subtotal">
                          <span>Add-ons Total</span>
                          <span>₱{calculateTotal().addOnsTotal.toLocaleString()}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="receipt-footer">
                  <div className="receipt-row total">
                    <span>Total Cost</span>
                    <span>₱{calculateTotal().total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="payment">
            <h2>Payment Information</h2>
            <div className="payment-methods">
              {paymentMethods.map(method => (
                <div
                  key={method.id}
                  className={`payment-method-card ${selectedPaymentMethod === method.id ? 'selected' : ''}`}
                  onClick={() => handlePaymentMethodClick(method.id)}
                >
                  <div className="payment-method-icon">{method.icon}</div>
                  <div className="payment-method-details">
                    <h3>{method.name}</h3>
                    <p>{method.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {isPaymentModalOpen && (
              <div className="payment-modal">
                <div className="modal-content">
                  <div className="modal-header">
                    <h3>{paymentMethods.find(m => m.id === tempPaymentMethod)?.name}</h3>
                    <button className="close-button" onClick={() => handleModalClose(false)}>×</button>
                  </div>

                  <div className="modal-body">
                    {paymentValidationError && (
                      <div className="modal-validation-error">
                        {paymentValidationError}
                      </div>
                    )}

                    {tempPaymentMethod === 'credit-card' && (
                      <div className="credit-card-container">
                        <div className="credit-card-preview">
                          <div className={`card-face ${cardType?.name || ''}`}>
                            <div className="card-header">
                              <div className="card-type">{cardType?.icon || '💳'}</div>
                              <div className="card-brand">{cardType?.name || 'CARD'}</div>
                            </div>
                            <div className="card-number">
                              {paymentDetails.cardNumber || '•••• •••• •••• ••••'}
                            </div>
                            <div className="card-details">
                              <div className="card-holder">
                                <label>Card Holder</label>
                                <div>{paymentDetails.cardName || 'YOUR NAME'}</div>
                              </div>
                              <div className="card-expires">
                                <label>Expires</label>
                                <div>{paymentDetails.expiryDate || 'MM/YY'}</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="credit-card-form">
                          <div className="form-group">
                            <label>Card Number</label>
                            <input
                              type="text"
                              maxLength={19}
                              value={paymentDetails.cardNumber}
                              onChange={handleCardNumberChange}
                              placeholder="1234 5678 9012 3456"
                            />
                          </div>
                          <div className="form-group">
                            <label>Cardholder Name</label>
                            <input
                              type="text"
                              value={paymentDetails.cardName}
                              onChange={(e) => setPaymentDetails({ ...paymentDetails, cardName: e.target.value.toUpperCase() })}
                              placeholder="JOHN DOE"
                            />
                          </div>
                          <div className="form-row">
                            <div className="form-group">
                              <label>Expiry Date</label>
                              <input
                                type="text"
                                maxLength={5}
                                value={paymentDetails.expiryDate}
                                onChange={(e) => {
                                  let value = e.target.value.replace(/\D/g, '');
                                  if (value.length >= 2) {
                                    value = value.slice(0, 2) + '/' + value.slice(2);
                                  }
                                  setPaymentDetails({ ...paymentDetails, expiryDate: value });
                                }}
                                placeholder="MM/YY"
                              />
                            </div>
                            <div className="form-group">
                              <label>CVV</label>
                              <input
                                type="password"
                                maxLength={3}
                                value={paymentDetails.cvv}
                                onChange={(e) => setPaymentDetails({ ...paymentDetails, cvv: e.target.value.replace(/\D/g, '') })}
                                placeholder="123"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {tempPaymentMethod === 'gcash' && (
                      <div className="alternative-payment">
                        <div className="qr-section">
                          <img src={gcashQR} alt="GCash QR Code" className="qr-code" />
                          <p>Scan QR code to pay via GCash</p>
                          <p className="qr-note">Reference number will be shown after successful payment</p>
                        </div>

                        <div className="payment-form">
                          <div className="form-group">
                            <label>GCash Reference Number</label>
                            <input
                              type="text"
                              value={paymentDetails.referenceNumber}
                              onChange={(e) => setPaymentDetails({ ...paymentDetails, referenceNumber: e.target.value })}
                              placeholder="Enter reference number from GCash"
                            />
                          </div>

                          <div className="upload-section">
                            <p className="upload-instruction">Please ensure the reference number is visible in the screenshot</p>
                            <label className="upload-label">
                              Upload Payment Screenshot
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                              />
                            </label>
                            {paymentDetails.paymentProof && (
                              <p className="file-name">Selected: {paymentDetails.paymentProof.name}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {tempPaymentMethod === 'bank-transfer' && (
                      <div className="alternative-payment">
                        <div className="bank-details">
                          <h3>Bank Transfer Details</h3>
                          <div className="bank-info">
                            <p><strong>Bank:</strong> BDO</p>
                            <p><strong>Account Name:</strong> Costas De Liwa Resort</p>
                            <p><strong>Account Number:</strong> 1234 5678 9012</p>
                          </div>
                        </div>

                        <div className="payment-form">
                          <div className="form-group">
                            <label>Sender's Name</label>
                            <input
                              type="text"
                              value={paymentDetails.senderName}
                              onChange={(e) => setPaymentDetails({ ...paymentDetails, senderName: e.target.value })}
                              placeholder="Enter sender's name"
                            />
                          </div>

                          <div className="form-group">
                            <label>Sender's Bank</label>
                            <input
                              type="text"
                              value={paymentDetails.senderBank}
                              onChange={(e) => setPaymentDetails({ ...paymentDetails, senderBank: e.target.value })}
                              placeholder="Enter sender's bank"
                            />
                          </div>

                          <div className="form-group">
                            <label>Reference Number</label>
                            <input
                              type="text"
                              value={paymentDetails.referenceNumber}
                              onChange={(e) => setPaymentDetails({ ...paymentDetails, referenceNumber: e.target.value })}
                              placeholder="Enter bank reference number"
                            />
                          </div>

                          <div className="form-group">
                            <label>Date of Transfer</label>
                            <input
                              type="date"
                              value={paymentDetails.dateOfTransfer}
                              onChange={(e) => setPaymentDetails({ ...paymentDetails, dateOfTransfer: e.target.value })}
                            />
                          </div>

                          <div className="upload-section">
                            <p className="upload-instruction">Please upload a clear photo/screenshot of your payment receipt</p>
                            <label className="upload-label">
                              Upload Payment Receipt
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                              />
                            </label>
                            {paymentDetails.paymentProof && (
                              <p className="file-name">Selected: {paymentDetails.paymentProof.name}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="modal-footer">
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => handleModalClose(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleModalClose(true)}
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="payment-total">
              <h3>Total Amount Due</h3>
              <p className="total-amount">₱{calculateTotal().total.toLocaleString()}</p>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="confirmation" ref={printRef}>
            <div className="confirmation-content">
              <div className="print-header">
                <h1>Costas De Liwa Resort</h1>
                <p>San Felipe, Zambales</p>
              </div>

              <div className="confirmation-icon">✓</div>
              <h2>Booking Confirmed!</h2>
              
              <div className="reference-container">
                <div className="reference-number">
                  <h3>Reference Number</h3>
                  <strong>{bookingReference}</strong>
                </div>
              </div>

              <div className="receipt">
                <div className="receipt-header">
                  <h3>BOOKING RECEIPT</h3>
                  <p className="receipt-date">Date: {new Date().toLocaleDateString()}</p>
                </div>

                <div className="receipt-main">
                  <div className="receipt-column">
                    <div className="receipt-section">
                      <h4>Room Details</h4>
                      <div className="receipt-row">
                        <span>Room Type</span>
                        <span>{selectedRoom?.type}</span>
                      </div>
                      <div className="receipt-row">
                        <span>Rate per Night</span>
                        <span>₱{selectedRoom?.price.weekday.toLocaleString()} - ₱{selectedRoom?.price.weekend.toLocaleString()}</span>
                      </div>
                      <div className="receipt-row">
                        <span>Number of Nights</span>
                        <span>{calculateTotal().nights}</span>
                      </div>
                    </div>

                    <div className="receipt-section">
                      <h4>Stay Information</h4>
                      <div className="receipt-row">
                        <span>Check-in</span>
                        <span>{dates.checkIn}</span>
                      </div>
                      <div className="receipt-row">
                        <span>Check-out</span>
                        <span>{dates.checkOut}</span>
                      </div>
                    </div>

                    <div className="receipt-section">
                      <h4>Guest Information</h4>
                      <div className="receipt-row">
                        <span>Guests</span>
                        <span>{guests.adults} Adults, {guests.children} Children</span>
                      </div>
                    </div>
                  </div>

                  <div className="receipt-column">
                    {selectedAddOns.length > 0 && (
                      <div className="receipt-section">
                        <h4>Add-ons</h4>
                        {selectedAddOns.map(addOnId => {
                          const addOn = addOns.find(a => a.id === addOnId);
                          return addOn && (
                            <div key={addOn.id} className="receipt-row">
                              <span>{addOn.name}</span>
                              <span>₱{addOn.price.toLocaleString()}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="receipt-section">
                      <h4>Payment Summary</h4>
                      <div className="receipt-row subtotal">
                        <span>Room Total</span>
                        <span>₱{calculateTotal().roomTotal.toLocaleString()}</span>
                      </div>
                      {calculateTotal().addOnsTotal > 0 && (
                        <div className="receipt-row subtotal">
                          <span>Add-ons Total</span>
                          <span>₱{calculateTotal().addOnsTotal.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="receipt-row grand-total">
                        <span>Grand Total</span>
                        <span>₱{calculateTotal().total.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="receipt-section">
                      <h4>Important Information</h4>
                      <ul className="info-list">
                        <li>Check-in time: 2:00 PM</li>
                        <li>Check-out time: 12:00 PM</li>
                        <li>Present this receipt upon check-in</li>
                        <li>Outside food and beverages are not permitted</li>
                        <li>Cancellation policy applies</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="receipt-footer">
                  <div className="contact-info">
                    <p>For assistance, contact us:</p>
                    <p>Phone: +63 XXX XXX XXXX</p>
                    <p>Email: info@costasdeliwa.com</p>
                  </div>
                </div>
              </div>

              <div className="confirmation-actions">
                <button
                  className="btn btn-secondary"
                  onClick={handlePrint}
                >
                  Print Receipt
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleBackToHome}
                >
                  Return to Home
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="booking-page">
      {showDialog && (
        <LoadingDialog message={dialogMessage} />
      )}

      {isReturningHome && (
        <LoadingDialog message={currentPhase === 5 
          ? "Thank you for booking with us! Redirecting to home..." 
          : "Redirecting to home page..."} 
        />
      )}

      <div className="booking-progress">
        {phases.slice(0, -1).map((phase, index) => (
          <div
            key={index}
            className={`progress-step ${index === currentPhase ? 'active' : ''} ${index < currentPhase ? 'completed' : ''}`}
          >
            <div className="step-number">{index + 1}</div>
            <div className="step-label">{phase}</div>
          </div>
        ))}
      </div>
      
      <div className="booking-content">
        {validationError && (
          <div className="validation-error">
            {validationError}
          </div>
        )}
        {renderPhase()}
      </div>

      <div className="booking-navigation">
        {currentPhase < 5 && (
          <button
            className="btn btn-secondary"
            onClick={handleBackToHome}
          >
            Back to Home
          </button>
        )}
        {currentPhase < phases.length - 2 && (
          <div className="booking-navigation-right">
            {currentPhase > 0 && (
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setValidationError('');
                  setCurrentPhase(currentPhase - 1);
                }}
              >
                Previous
              </button>
            )}
            <button
              className="btn btn-primary"
              onClick={handleNextPhase}
              disabled={currentPhase === 0 && !selectedRoom}
            >
              Next
            </button>
          </div>
        )}
        {currentPhase === 4 && (
          <div className="booking-navigation-right">
            <button
              className="btn btn-secondary"
              onClick={() => {
                setValidationError('');
                setCurrentPhase(currentPhase - 1);
              }}
            >
              Previous
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                if (validatePaymentDetails()) {
                  handlePaymentSubmit();
                }
              }}
            >
              Complete Payment
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Booking; 