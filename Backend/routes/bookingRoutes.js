const express = require('express');
const router = express.Router();

// 1. Import Controllers (Notice getMyBookings is now included here!)
const { getBookedSeats, createBooking, getMyBookings } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

// --- BOOKING ROUTES ---

// Public: Get booked seats for a movie
router.get('/movie/:movieId', getBookedSeats);

// Protected: Get logged in user's tickets
router.get('/my-tickets', protect, getMyBookings);

// Protected: Create a new booking
router.post('/', protect, createBooking);

module.exports = router;