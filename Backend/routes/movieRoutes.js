const express = require('express');
const router = express.Router();
const { getMovies, createMovie, deleteMovie } = require('../controllers/movieController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../config/cloudinary'); // Import Cloudinary

router.get('/', getMovies);
// Inject upload.single('poster') before createMovie
router.post('/', protect, admin, upload.single('poster'), createMovie); 
router.delete('/:id', protect, admin, deleteMovie);

module.exports = router;