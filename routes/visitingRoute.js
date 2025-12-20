const router = require("express").Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

// Controller
const {
    createVisitingcards,
    getAllVisitingcards,
    getVisitingcardById,
    getByCategoryName,
    getBySubCategoryName,
    getByProductName,
    updateVisitingcard,
    deleteVisitingcard,

    createUserCard,
    getAllUserCards,
    getUserCardById,
    getUserCardsByUser,

    updateUserCard,
    deleteUserCard,
    
    addToCart,
  getCartByUser,
  updateCartItem,
  removeCartItem,
  clearCart,
  getAllCarts,
  createOrderFromCart,
    getOrderById,
  getOrdersByUser,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  deleteOrder
} = require("../controllers/visitingcardController");

// ========================= ROUTES =========================

// Create master product
router.post("/create-visitingcard", upload.array("images"), createVisitingcards);

// Get all master products
router.get("/all", getAllVisitingcards);

// Specific filter routes - keep these BEFORE dynamic routes
router.get("/category/:name", getByCategoryName);
router.get("/subcategory/:name", getBySubCategoryName);
router.get("/product/:name", getByProductName);

// User card routes
router.post("/user/create-card", upload.array("images"), createUserCard);
router.get("/user-cards", getAllUserCards);  // This needs to be BEFORE /user/card/:id
router.get("/user/card/:id", getUserCardById);
router.get("/user/cards/:userId", getUserCardsByUser);
router.put("/user/card/:id", upload.array("images"), updateUserCard);
router.delete("/user/card/:id", deleteUserCard);

// Get by ID for master product - should be LAST to avoid conflicts
router.get("/:id", getVisitingcardById);

// Update master product
router.patch("/update/:id", updateVisitingcard);

// Delete master product
router.delete("/delete/:id", deleteVisitingcard);


// Add item to cart
router.post("/cart/add", upload.any(), addToCart);

// Get user cart
router.get("/cart/:userId", getCartByUser);

// Update cart item
router.put("/cart/item/:id", upload.single("designFile"), updateCartItem);

// Remove item from cart
router.delete("/cart/item/:id", removeCartItem);

// Clear user cart
router.delete("/cart/clear/:userId", clearCart);

router.get("/cart", getAllCarts);


/* ==================== ORDER ROUTES ==================== */

// Create order from cart
router.post("/order/create", createOrderFromCart);
router.post("/order/create", createOrderFromCart);
router.get("/order/:orderId", getOrderById);
router.get("/orders/user/:userId", getOrdersByUser);
router.get("/orders", getAllOrders);                // Admin
router.put("/order/status/:orderId", updateOrderStatus);
router.put("/order/cancel/:orderId", cancelOrder);
router.delete("/order/:orderId", deleteOrder);      // Optional


module.exports = router;