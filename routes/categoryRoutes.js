const express = require('express');
const router = express.Router();
const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
} = require('../controllers/CategoryController');
const { uploadCategoryImg } = require('../middleware/upload');

// :white_tick: Create Category
router.post('/create-category', uploadCategoryImg.single('image'), createCategory);

// :white_tick: Get All Categories
router.get('/allcategories', getAllCategories);

// :white_tick: Get Category by ID
router.get('/get-category/:categoryId', getCategoryById);

// :white_tick: Update Category
router.put('/update-category/:categoryId', updateCategory);

// :white_tick: Delete Category
router.delete('/delete-category/:categoryId', deleteCategory);

module.exports = router;