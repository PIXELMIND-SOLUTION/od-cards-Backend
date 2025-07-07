const express = require('express');
const router = express.Router();
const { 
  createReview,
  getAllReviews,
  getReviewById,
  updateReview,
  deleteReview
} = require('../controllers/reviewController');
const { uploadReviewImage } = require('../middleware/upload');

// Create review with image upload
router.post('/create-review', uploadReviewImage, createReview);

// Get all reviews
router.get('/allreviews', getAllReviews);

// Get single review
router.get('/getreview/:id', getReviewById);

// Update review (with optional image update)
router.put('/updatereview/:id', uploadReviewImage, updateReview);

// Delete review
router.delete('/deletereview/:id', deleteReview);

module.exports = router;