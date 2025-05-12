const express = require('express');
const router = express.Router();
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getVisitingCardProducts,
  getInvitationCardProducts
} = require('../controllers/ProductController');

// ✅ Create Product
router.post('/create-product', createProduct);

// ✅ Get All Products
router.get('/getallproducts', getAllProducts);
router.get('/visiting-cards', getVisitingCardProducts);
router.get('/getallinvitaioncards', getInvitationCardProducts);


// ✅ Get Product by ID
router.get('/singleproduct/:productId', getProductById);

// ✅ Update Product
router.put('/updateproduct/:productId', updateProduct);

// ✅ Delete Product
router.delete('/deleteproduct/:productId', deleteProduct);

module.exports = router;
