const express = require('express');
const router = express.Router();

// 1. Import Controllers and Middleware
const { 
    registerUser, 
    loginUser, 
    verifyOTP, 
    getPendingUsers, 
    approveUser 
} = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

// --- STANDARD AUTHENTICATION ROUTES ---
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-otp', verifyOTP);

// --- ADMIN APPROVAL ROUTES ---
// We use 'protect' and 'admin' middleware to ensure ONLY admins can access these
router.get('/pending-users', protect, admin, getPendingUsers);
router.put('/approve-user/:id', protect, admin, approveUser);

// You can add the delete/reject route here too
// router.delete('/reject-user/:id', protect, admin, rejectUser);

module.exports = router;