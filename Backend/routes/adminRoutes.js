const express = require('express');
const router = express.Router();
const { approveUser } = require('../controllers/adminController');

// Import your existing auth middlewares to protect this route
const { protect, admin } = require('../middleware/authMiddleware'); 

// The 'protect' middleware ensures they are logged in
// The 'admin' middleware ensures their role is 'admin'
router.put('/approve-user/:id', protect, admin, approveUser);

module.exports = router;