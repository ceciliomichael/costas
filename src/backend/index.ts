import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import connectDB from './config/db';
import Booking from './models/Booking';
import Image from './models/Image';
import ContactMessage from './models/ContactMessage';
import { IBooking, BookingStatistics } from './types/booking';
import { IContactMessage } from './models/ContactMessage';
import { PipelineStage } from 'mongoose';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: ['https://costas.pages.dev', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
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

// Configure multer for memory storage (for base64 conversion)
const memoryStorage = multer.memoryStorage();
const uploadToMemory = multer({
  storage: memoryStorage,
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
app.post('/api/bookings', uploadToMemory.single('paymentProof'), async (req: MulterRequest, res: Response) => {
  try {
    console.log('Received booking data:', req.body);
    console.log('Received file:', req.file);

    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'date', 'checkInDate', 'checkOutDate', 'roomType', 'numberOfGuests', 'adults'];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(', ')}`,
        missingFields
      });
    }

    let paymentProofId;
    if (req.file) {
      // Convert file buffer to base64
      const base64Data = req.file.buffer.toString('base64');
      
      // Create new image document
      const image = new Image({
        name: req.file.originalname,
        data: base64Data,
        contentType: req.file.mimetype
      });

      // Save image to MongoDB
      const savedImage = await image.save();
      paymentProofId = savedImage._id;
    }

    // Create booking data with image reference
    const bookingData = {
      ...req.body,
      paymentProofId
    };

    // Create and save the booking
    const booking = new Booking(bookingData);

    try {
      const savedBooking = await booking.save();
      console.log('Booking saved successfully:', savedBooking);
      res.status(201).json(savedBooking);
    } catch (validationError) {
      // If booking fails, delete the uploaded image
      if (paymentProofId) {
        await Image.findByIdAndDelete(paymentProofId);
      }
      console.error('Validation error:', validationError);
      res.status(400).json({
        message: 'Validation error',
        errors: validationError
      });
    }
  } catch (error) {
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
      .populate('paymentProofId')
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
    const booking = await Booking.findById(req.params.id).populate('paymentProofId');
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

// Image upload route with base64 conversion
app.post('/api/images/upload', uploadToMemory.single('image'), async (req: MulterRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Convert file buffer to base64
    const base64Data = req.file.buffer.toString('base64');
    
    // Create new image document
    const image = new Image({
      name: req.file.originalname,
      data: base64Data,
      contentType: req.file.mimetype
    });

    // Save to MongoDB
    const savedImage = await image.save();

    res.status(201).json({
      message: 'Image uploaded successfully',
      imageId: savedImage._id,
      name: savedImage.name
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      message: 'Error uploading image',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get image by ID
app.get('/api/images/:id', async (req: Request, res: Response) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    res.json({
      name: image.name,
      contentType: image.contentType,
      data: image.data,
      uploadDate: image.uploadDate
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error retrieving image',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete image by ID
app.delete('/api/images/:id', async (req: Request, res: Response) => {
  try {
    const image = await Image.findByIdAndDelete(req.params.id);
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting image',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Contact Message Routes
app.post('/api/contact', async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message } = req.body;
    
    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, subject, and message'
      });
    }
    
    // Create new contact message
    const contactMessage = new ContactMessage({
      name,
      email,
      subject,
      message,
      createdAt: new Date(),
      isRead: false
    });
    
    // Save to database
    await contactMessage.save();
    
    return res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully!',
      data: contactMessage
    });
  } catch (error) {
    console.error('Error saving contact message:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while sending your message. Please try again later.'
    });
  }
});

// Get all contact messages (for admin)
app.get('/api/contact/messages', async (req: Request, res: Response) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching contact messages'
    });
  }
});

// Get a single contact message by ID
app.get('/api/contact/messages/:id', async (req: Request, res: Response) => {
  try {
    const message = await ContactMessage.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Error fetching contact message:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching the contact message'
    });
  }
});

// Mark a message as read
app.put('/api/contact/messages/:id/read', async (req: Request, res: Response) => {
  try {
    const message = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Message marked as read',
      data: message
    });
  } catch (error) {
    console.error('Error updating contact message:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while updating the contact message'
    });
  }
});

// Delete a contact message
app.delete('/api/contact/messages/:id', async (req: Request, res: Response) => {
  try {
    const message = await ContactMessage.findByIdAndDelete(req.params.id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Contact message deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting contact message:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while deleting the contact message'
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 