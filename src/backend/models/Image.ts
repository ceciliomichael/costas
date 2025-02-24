import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  data: {
    type: String, // base64 encoded string
    required: true
  },
  contentType: {
    type: String,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Image', imageSchema); 