import { Document } from 'mongoose';

export interface IBooking extends Document {
  firstName: string;
  lastName: string;
  date: Date;
  checkInDate: Date;
  checkOutDate: Date;
  roomType: string;
  numberOfGuests: number;
  adults: number;
  children?: number;
  totalAmount: number;
  bookingReference: string;
  status: 'pending' | 'completed' | 'cancelled';
  paymentProofPath?: string;
  email: string;
  phoneNumber?: string;
  specialRequests?: string;
  time?: string;
  paymentMethod: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  addOns?: string[];
  createdAt?: Date;
}

export interface BookingStatistics {
  roomTypeStats: Record<string, number>;
  monthlyRevenue: Record<string, number>;
  recentBookings: IBooking[];
  totalBookings: number;
  totalRevenue: number;
} 