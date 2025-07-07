const express = require('express');
const router = express.Router();
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getVisitingCardProducts,
  getInvitationCardProducts,
  createVisitingCards,
  getAllVisitingCards,
  getSingleVisitingCard,
  createBoardVisitingCards,
  getAllBoardVisitingCards,
  getBoardVisitingCardById,
  getTrumpVisitingCardOrders,
  getTrumpBothSidePrintOrders,
  getBoardVisitingCardOrders,
  getPocketCalenderOrders,
  getBoardMixingJobsOrders,
  getDigitalPrints,
  getStickerDigitalPrints,
  getAllCardsWithCat,
  updateCard,
  deleteCard
} = require('../controllers/ProductController');
const { uploadVisitingCardImgMultiple, uploadBoardCardImages } = require('../middleware/upload');

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

//create visiting products

router.post(
  '/create-card',
  uploadVisitingCardImgMultiple,
  createVisitingCards
);

router.get('/allvisingcards', getAllVisitingCards);
router.get('/singlevisingcard/:id', getSingleVisitingCard);
router.get('/trumponeside-cards', getTrumpVisitingCardOrders);
router.get('/trumpbothside-cards', getTrumpBothSidePrintOrders);
router.get('/get-board-visiting-cards', getBoardVisitingCardOrders);
// GET route for Pocket Calenders
router.get(
  '/get-pocket-calender-orders',
  getPocketCalenderOrders
);

// GET route for Board Mixing Jobs
router.get(
  '/get-board-mixing-jobs-orders',
  getBoardMixingJobsOrders
);

//board visiting cards

router.post(
  '/board-visiting-cards',
  uploadBoardCardImages,
  createBoardVisitingCards
);

// 🔽 Get all
router.get('/board-visiting-cards', getAllBoardVisitingCards);

// 🔽 Get one by ID
router.get('/board-visiting-cards/:id', getBoardVisitingCardById);

router.get('/digital-prints', getDigitalPrints);

router.get('/sticker-digital-prints', getStickerDigitalPrints);


//get all cards based on a cateogry
router.post('/get-cards', getAllCardsWithCat);
router.put('/update-card/:id',uploadVisitingCardImgMultiple, updateCard);
router.delete('/delete-card/:id', deleteCard);


module.exports = router;
