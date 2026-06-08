const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  genre: { type: String, required: true },
  duration: { type: String, required: true },
  posterUrl: { type: String },
  showDate: { type: String, required: true }, // Stores e.g. "2024-12-25"
  showTime: { type: String, required: true }, // Stores e.g. "18:30"
  expiresAt: { type: Date, required: true } ,  // The internal Javascript clock
  status: { 
    type: String, 
    enum: ['Now Showing', 'Coming Soon'], 
    default: 'Now Showing' 
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User' // Links the movie to the admin who added it
  }
}, { timestamps: true });

module.exports = mongoose.model('Movie', movieSchema);