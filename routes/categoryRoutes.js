const express = require('express');
const router = express.Router();
const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
} = require('../controllers/CategoryController');

// ✅ Create Category
router.post('/create-category', createCategory);

// ✅ Get All Categories
router.get('/allcategories', getAllCategories);

// ✅ Get Category by ID
router.get('/get-category/:categoryId', getCategoryById);

// ✅ Update Category
router.put('/update-category/:categoryId', updateCategory);

// ✅ Delete Category
router.delete('/delete-category/:categoryId', deleteCategory);

module.exports = router;
