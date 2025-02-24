import mongoose from 'mongoose';
import { IBooking } from '../types/booking';

const bookingSchema = new mongoose.Schema<IBooking>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  date: { type: Date, required: true },
  checkInDate: { type: Date, required: true },
  checkOutDate: { type: Date, required: true },
  roomType: { type: String, required: true },
  numberOfGuests: { type: Number, required: true },
  adults: { type: Number, required: true },
  children: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  bookingReference: { type: String, required: true, unique: true },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentProofId: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' },
  email: { type: String, required: true },
  phoneNumber: { type: String, default: '' },
  specialRequests: { type: String, default: '' },
  time: { type: String, default: '14:00' },
  paymentMethod: { type: String, required: true },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  addOns: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IBooking>('Booking', bookingSchema); 