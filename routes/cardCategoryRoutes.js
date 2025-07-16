const express = require('express');
const router = express.Router();
const {
  createCardCategory,
  getAllCardCategories,
  updateCardCategory,
  deleteCardCategory
} = require('../controllers/cardCategoryController');
const { uploadCardCategoryImageSingle } = require('../middleware/upload');

router.post('/create-card', uploadCardCategoryImageSingle, createCardCategory);
router.get('/getallcards', getAllCardCategories);
router.put('/updatecard/:id', uploadCardCategoryImageSingle, updateCardCategory);
router.delete('/deletecard/:id', deleteCardCategory);

module.exports = router;
