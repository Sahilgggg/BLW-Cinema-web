const Booking = require('../models/Booking');
const redis = require('../config/redis');

// @desc    Get all booked seats for a specific movie
exports.getBookedSeats = async (req, res) => {
  try {
    const bookings = await Booking.find({ movie: req.params.movieId, status: 'Confirmed' });
    
    let bookedSeats = [];
    bookings.forEach(booking => {
      booking.seats.forEach(seat => {
        bookedSeats.push(seat.seatId);
      });
    });

    res.json(bookedSeats);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching seats' });
  }
};

// @desc    Get logged in user's bookings
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).populate('movie');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tickets' });
  }
};

// @desc    Create a new booking with Redis Concurrency Locking
exports.createBooking = async (req, res) => {
  const { movieId, seats, totalAmount } = req.body;
  const userId = req.user._id.toString();

  try {
    // --- 1. REDIS LOCKING PHASE ---
    const lockPromises = seats.map(seat => {
      const lockKey = `lock:movie:${movieId}:seat:${seat.seatId}`;
      return redis.set(lockKey, userId, 'EX', 120, 'NX'); 
    });

    const lockResults = await Promise.all(lockPromises);
    const failedLocks = lockResults.some(result => result === null);

    if (failedLocks) {
      seats.forEach(async (seat, index) => {
        if (lockResults[index] !== null) {
          await redis.del(`lock:movie:${movieId}:seat:${seat.seatId}`);
        }
      });
      return res.status(409).json({ message: 'Another user is currently booking one of these seats!' });
    }

    // --- 2. MONGODB WRITE PHASE ---
    const booking = new Booking({
      user: userId,
      movie: movieId,
      seats,
      totalAmount
    });

    const savedBooking = await booking.save();

    // --- 3. CACHE CLEARING PHASE ---
    seats.forEach(async (seat) => {
      await redis.del(`lock:movie:${movieId}:seat:${seat.seatId}`);
    });

    res.status(201).json(savedBooking);

  } catch (error) {
    console.error('Booking Error:', error);
    seats.forEach(async (seat) => {
      await redis.del(`lock:movie:${movieId}:seat:${seat.seatId}`);
    });
    res.status(500).json({ message: 'Server Error during checkout' });
  }
};