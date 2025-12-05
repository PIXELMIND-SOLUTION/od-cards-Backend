const express = require('express');
const router = express.Router();

const multer = require('multer');
const upload = multer();

const {
  registerUser,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  addToCart,
  getAllCartItems,
  getCartById,
  getMyCart,
  updateCartById,
  deleteCartById,
  createOrder,
  getAllOrders,
  getOrderById,
  getMyOrders,
  getSingleOrder,
  updateOrderById,
  deleteOrder
} = require("../controllers/UserController");
const { uploadDesignFile } = require('../middleware/upload');

router.post('/register', registerUser);
router.get('/getallusers', getAllUsers);
router.get('/user/:id', getUserById);
router.put('/updateuser/:id', updateUserById);
router.delete('/deleteuser/:id', deleteUserById);
router.post('/add-to-cart', addToCart);
router.get('/cart', getAllCartItems);
router.get('/cart/:id', getCartById);
router.get('/mycart/:userId', getMyCart);
router.put('/cart/:id', updateCartById);
router.delete('/cart/:id', deleteCartById);
router.post('/create-order', createOrder);
router.get('/getall-orders', getAllOrders);
router.get('/getorder/:orderId', getOrderById);

router.get('/myorders/:userId', getMyOrders);
router.get('/mysingleorder/:id', getSingleOrder);

router.put('/update-order/:orderId', updateOrderById);
router.delete('/delete/:orderId', deleteOrder);
module.exports = router;
