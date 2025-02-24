import { Document, Types } from 'mongoose';

export interface IBooking extends Document {
  _id?: string;
  firstName: string;
  lastName: string;
  date: Date;
  checkInDate: Date;
  checkOutDate: Date;
  roomType: string;
  numberOfGuests: number;
  adults: number;
  children: number;
  totalAmount: number;
  bookingReference: string;
  status: 'pending' | 'completed' | 'cancelled';
  paymentProofId?: Types.ObjectId;
  email: string;
  phoneNumber: string;
  specialRequests?: string;
  time: string;
  paymentMethod: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  addOns: string;
  createdAt?: Date;
}

export interface BookingStatistics {
  roomTypeStats: Record<string, number>;
  monthlyRevenue: Record<string, number>;
  recentBookings: IBooking[];
  totalBookings: number;
  totalRevenue: number;
} 