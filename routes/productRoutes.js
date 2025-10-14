const express = require('express');
const router = express.Router();

const {
  // Product routes
  createProduct,
  getAllProducts,
  getProductById,
  updateProductById,
  deleteProduct,

  // Visiting card routes
  createVisitingCards,
  getAllVisitingCards,
  getSingleVisitingCard,
  updateCard,
  deleteCard,
  getAllCardsWithCat,

  // Board visiting card routes
  createBoardVisitingCards,
  getAllBoardVisitingCards,
  getBoardVisitingCardById,

  // Specialized card routes
  getVisitingCardProducts,
  getInvitationCardProducts,
  getTrumpVisitingCardOrders,
  getTrumpBothSidePrintOrders,
  getBoardVisitingCardOrders,
  getPocketCalenderOrders,
  getBoardMixingJobsOrders,
  getSpecialBoardVisitingCards,
  getSpotLaminationCards,
  getGoldFoilCards,
  getBondPaperAboveQty,
  getBondPaperBelowQty,
  getStickerMixingJobs,
  getOffsetMixingJobs,
  getDieCuttingCards,
  getFluteBoardJobs,
  getDigitalPrints,
  getStickerDigitalPrints,
} = require('../controllers/ProductController');

const { uploadVisitingCardImgMultiple, uploadBoardCardImages } = require('../middleware/upload');

// ==================== Product Routes ====================

// Create a new product
router.post('/create-product', uploadVisitingCardImgMultiple, createProduct);

// Get all products
router.get('/getallproducts', getAllProducts);

// Get single product by ID
router.get('/singleproduct/:id', getProductById);

// Update product by ID
router.put('/update-product/:id', uploadVisitingCardImgMultiple, updateProductById);

// Delete product by ID
router.delete('/delete-product/:id', deleteProduct);

// ==================== Visiting Card Routes ====================

// Get all visiting card products
router.get('/visiting-cards', getVisitingCardProducts);

// Get all invitation card products
router.get('/getallinvitationcards', getInvitationCardProducts);

// Create visiting card order
router.post('/create-card', uploadVisitingCardImgMultiple, createVisitingCards);

// Get all visiting card orders
router.get('/allvisitingcards', getAllVisitingCards);

// Get single visiting card order by ID
router.get('/singlevisitingcard/:id', getSingleVisitingCard);

// Update visiting card order
router.put('/updatevisitingcard/:id', uploadVisitingCardImgMultiple, updateCard);

// Delete visiting card order
router.delete('/deletevisitingcard/:id', deleteCard);

// Get visiting cards by category
router.post('/getcardsbycategory', getAllCardsWithCat);

// ==================== Board Visiting Card Routes ====================

// Create board visiting card order
router.post('/create-board-card', uploadBoardCardImages, createBoardVisitingCards);

// Get all board visiting card orders
router.get('/allboardvisitingcards', getAllBoardVisitingCards);

// Get single board visiting card order by ID
router.get('/singleboardvisitingcard/:id', getBoardVisitingCardById);

// ==================== Specialized Visiting Card Orders ====================

router.get('/trumponeside-cards', getTrumpVisitingCardOrders);
router.get('/trumpbothside-cards', getTrumpBothSidePrintOrders);
router.get('/boardvisitingcards-orders', getBoardVisitingCardOrders);
router.get('/pocketcalender-orders', getPocketCalenderOrders);
router.get('/boardmixingjobs-orders', getBoardMixingJobsOrders);
router.get('/specialboardvisitingcards', getSpecialBoardVisitingCards);
router.get('/spotlaminationcards', getSpotLaminationCards);
router.get('/goldfoilcards', getGoldFoilCards);
router.get('/bondpaperaboveqty', getBondPaperAboveQty);
router.get('/bondpaperbelowqty', getBondPaperBelowQty);
router.get('/stickermixingjobs', getStickerMixingJobs);
router.get('/offsetmixingjobs', getOffsetMixingJobs);
router.get('/diecuttingcards', getDieCuttingCards);
router.get('/fluteboardjobs', getFluteBoardJobs);
router.get('/digitalprints', getDigitalPrints);
router.get('/stickerdigitalprints', getStickerDigitalPrints);

module.exports = router;
