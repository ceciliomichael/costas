const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');
const Booking = require('./models/Booking');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create a directory for the booking if it doesn't exist
    const bookingDir = path.join(uploadsDir, req.body.bookingReference);
    if (!fs.existsSync(bookingDir)) {
      fs.mkdirSync(bookingDir, { recursive: true });
    }
    cb(null, bookingDir);
  },
  filename: function (req, file, cb) {
    // Use original file name but make it safe
    const fileName = 'payment-proof' + path.extname(file.originalname);
    cb(null, fileName);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Connect to MongoDB
connectDB();

// Routes
app.post('/api/bookings', upload.single('paymentProof'), async (req, res) => {
  try {
    console.log('Received booking data:', req.body);
    console.log('Received file:', req.file);

    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'date', 'checkInDate', 'checkOutDate', 'roomType', 'numberOfGuests', 'adults'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      // If file was uploaded, delete it since validation failed
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
      // If validation fails, delete uploaded file
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      console.error('Validation error:', validationError);
      res.status(400).json({ 
        message: 'Validation error',
        errors: validationError.errors 
      });
    }
  } catch (error) {
    // If any error occurs, delete uploaded file
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Server error:', error);
    res.status(500).json({ 
      message: 'Server error while processing booking',
      error: error.message 
    });
  }
});

app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 