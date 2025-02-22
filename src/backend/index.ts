import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import connectDB from './config/db';
import Booking from './models/Booking';
import { IBooking, BookingStatistics } from './types/booking';
import { PipelineStage } from 'mongoose';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Add cache control middleware
app.use((req, res, next) => {
  // No cache headers
  res.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.header('Pragma', 'no-cache');
  res.header('Expires', '0');
  res.header('Surrogate-Control', 'no-store');
  next();
});

// Types for multer request
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    const bookingDir = path.join(uploadsDir, req.body.bookingReference);
    if (!fs.existsSync(bookingDir)) {
      fs.mkdirSync(bookingDir, { recursive: true });
    }
    cb(null, bookingDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const fileName = 'payment-proof' + path.extname(file.originalname);
    cb(null, fileName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'));
    }
    cb(null, true);
  }
});

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Connect to MongoDB
connectDB();

// Routes
app.post('/api/bookings', upload.single('paymentProof'), async (req: MulterRequest, res: Response) => {
  try {
    console.log('Received booking data:', req.body);
    console.log('Received file:', req.file);

    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'date', 'checkInDate', 'checkOutDate', 'roomType', 'numberOfGuests', 'adults'];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(', ')}`,
        missingFields
      });
    }

    // Add file path to booking data if file was uploaded
    const bookingData = {
      ...req.body,
      paymentProofPath: req.file ? `/uploads/${req.body.bookingReference}/${req.file.filename}` : ''
    };

    // Create and save the booking
    const booking = new Booking(bookingData);

    try {
      const savedBooking = await booking.save();
      console.log('Booking saved successfully:', savedBooking);
      res.status(201).json(savedBooking);
    } catch (validationError) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      console.error('Validation error:', validationError);
      res.status(400).json({
        message: 'Validation error',
        errors: validationError
      });
    }
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Server error:', error);
    res.status(500).json({
      message: 'Server error while processing booking',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get all bookings with filters
app.get('/api/bookings', async (req: Request, res: Response) => {
  try {
    const { status, startDate, endDate, search } = req.query;
    let query: any = {};

    // Add status filter if provided
    if (status && status !== 'all') {
      query.status = status;
    }

    // Add date range filter if both dates are provided
    if (startDate && endDate) {
      query.checkInDate = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }

    // Add search filter if provided
    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { bookingReference: searchRegex },
        { roomType: searchRegex }
      ];
    }

    console.log('Query:', query); // For debugging

    // Get bookings with filters and sort by date
    const bookings = await Booking.find(query)
      .sort({ date: -1 })
      .exec();

    console.log(`Found ${bookings.length} bookings`); // For debugging
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Unknown error',
      error: error 
    });
  }
});

// Update booking status
app.put('/api/bookings/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const booking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Get booking statistics
app.get('/api/bookings/statistics', async (req: Request, res: Response) => {
  try {
    const allBookings = await Booking.find();

    const statistics: BookingStatistics = {
      roomTypeStats: allBookings.reduce((acc: Record<string, number>, booking: IBooking) => {
        acc[booking.roomType] = (acc[booking.roomType] || 0) + 1;
        return acc;
      }, {}),
      monthlyRevenue: allBookings.reduce((acc: Record<string, number>, booking: IBooking) => {
        const month = new Date(booking.date).getMonth().toString();
        acc[month] = (acc[month] || 0) + booking.totalAmount;
        return acc;
      }, {}),
      recentBookings: await Booking.find().sort({ date: -1 }).limit(5),
      totalBookings: allBookings.length,
      totalRevenue: allBookings.reduce((sum: number, booking: IBooking) => sum + booking.totalAmount, 0)
    };

    res.json(statistics);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Get booking by ID
app.get('/api/bookings/:id', async (req: Request, res: Response) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Get all customers with search
app.get('/api/customers', async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    
    // Aggregate pipeline to get customer data with booking statistics
    const pipeline: PipelineStage[] = [
      // Group bookings by customer email
      {
        $group: {
          _id: '$email',
          firstName: { $first: '$firstName' },
          lastName: { $first: '$lastName' },
          email: { $first: '$email' },
          phoneNumber: { $first: '$phoneNumber' },
          totalBookings: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' },
          lastBooking: { $max: '$date' },
          bookingHistory: {
            $push: {
              _id: '$_id',
              bookingReference: '$bookingReference',
              checkInDate: '$checkInDate',
              checkOutDate: '$checkOutDate',
              roomType: '$roomType',
              totalAmount: '$totalAmount',
              status: '$status'
            }
          }
        }
      } as PipelineStage,
      // Sort by total spent (descending)
      { $sort: { totalSpent: -1 } } as PipelineStage
    ];

    // Add search filter if provided
    if (search) {
      pipeline.unshift({
        $match: {
          $or: [
            { firstName: { $regex: search as string, $options: 'i' } },
            { lastName: { $regex: search as string, $options: 'i' } },
            { email: { $regex: search as string, $options: 'i' } }
          ]
        }
      } as PipelineStage);
    }

    const customers = await Booking.aggregate(pipeline);
    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Unknown error',
      error: error 
    });
  }
});

// Get customer statistics
app.get('/api/customers/statistics', async (req: Request, res: Response) => {
  try {
    const pipeline: PipelineStage[] = [
      // Group bookings by customer email to get unique customers
      {
        $group: {
          _id: '$email',
          totalSpent: { $sum: '$totalAmount' },
          bookingCount: { $sum: 1 }
        }
      } as PipelineStage,
      // Group again to get overall statistics
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          totalRevenue: { $sum: '$totalSpent' },
          totalBookings: { $sum: '$bookingCount' }
        }
      } as PipelineStage
    ];

    const [statistics] = await Booking.aggregate(pipeline);
    
    res.json({
      totalCustomers: statistics?.totalCustomers || 0,
      totalRevenue: statistics?.totalRevenue || 0,
      averageBookingsPerCustomer: statistics ? 
        statistics.totalBookings / statistics.totalCustomers : 0
    });
  } catch (error) {
    console.error('Error fetching customer statistics:', error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Unknown error',
      error: error 
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 