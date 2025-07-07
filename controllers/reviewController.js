const Review = require("../models/Review");

// Create a review
exports.createReview = async (req, res) => {
  try {
    const { name, rating, comment } = req.body;
    const image = req.file ? `/uploads/reviews/${req.file.filename}` : null;

    const review = new Review({ 
      name, 
      image, 
      rating, 
      comment 
    });
    
    const savedReview = await review.save();
    res.status(201).json(savedReview);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all reviews
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get one review by ID
exports.getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a review
exports.updateReview = async (req, res) => {
  try {
    const { name, rating, comment } = req.body;
    let image;

    if (req.file) {
      image = `/uploads/reviews/${req.file.filename}`;
    } else if (req.body.image === 'null') {
      image = null;
    } else {
      // Keep existing image if not updating
      const existingReview = await Review.findById(req.params.id);
      image = existingReview?.image || null;
    }

    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      { name, rating, comment, image },
      { new: true }
    );

    if (!updatedReview) {
      return res.status(404).json({ error: "Review not found" });
    }
    res.json(updatedReview);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a review
exports.deleteReview = async (req, res) => {
  try {
    const deletedReview = await Review.findByIdAndDelete(req.params.id);
    if (!deletedReview) {
      return res.status(404).json({ error: "Review not found" });
    }
    res.json({ message: "Review deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};