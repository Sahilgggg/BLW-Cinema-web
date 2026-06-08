const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User' // Links to the customer
  },
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Movie' // Links to the movie
  },
  seats: [{
    seatId: { type: String, required: true },
    section: { type: String, required: true },
    price: { type: Number, required: true }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Confirmed', 'Cancelled'],
    default: 'Confirmed'
  }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);