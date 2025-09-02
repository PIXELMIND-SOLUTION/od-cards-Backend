const express = require('express');
const router = express.Router();
const { registerUser,
    getAllUsers,
    getUserById,
    updateUserById,
    deleteUserById,
    addToCart,
    getMyCart,
    createOrder,
    getMyOrders,
    getSingleOrder
} = require("../controllers/UserController");
const { uploadDesignFile } = require('../middleware/upload');

router.post('/register', registerUser);
router.get('/getallusers', getAllUsers);
router.get('/user/:id', getUserById);
router.put('/updateuser/:id', updateUserById);
router.delete('/deleteuser/:id', deleteUserById);
router.post('/add-to-cart', addToCart);
router.get('/mycart/:userId', getMyCart);
router.post('/create-order', createOrder);
router.get('/myorders/:userId', getMyOrders);
router.get('/mysingleorder/:userId/:orderId', getSingleOrder);
module.exports = router;
