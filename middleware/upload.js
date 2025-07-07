const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Common file filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.jpg', '.jpeg', '.png'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedTypes.includes(ext)) {
    return cb(new Error('Only JPG, JPEG, and PNG files are allowed'), false);
  }
  cb(null, true);
};

// 1. Category Image Upload Configuration
const categoryImgPath = path.join(__dirname, '../uploads/categoryImg');
if (!fs.existsSync(categoryImgPath)) {
  fs.mkdirSync(categoryImgPath, { recursive: true });
}

const categoryStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, categoryImgPath),
  filename: (req, file, cb) => {
    cb(null, `category_${Date.now()}${path.extname(file.originalname)}`);
  }
});

// 2. Visiting Card Upload Configuration
const visitingCardPath = path.join(__dirname, '../uploads/visitingCards');
if (!fs.existsSync(visitingCardPath)) {
  fs.mkdirSync(visitingCardPath, { recursive: true });
}

const visitingCardStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, visitingCardPath),
  filename: (req, file, cb) => {
    cb(null, `visitingcard_${Date.now()}_${Math.random().toString(36).substring(2, 9)}${path.extname(file.originalname)}`);
  }
});

// 3. Board Card Upload Configuration
const boardCardPath = path.join(__dirname, '../uploads/boardVisitingCards');
if (!fs.existsSync(boardCardPath)) {
  fs.mkdirSync(boardCardPath, { recursive: true });
}

const boardCardStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, boardCardPath),
  filename: (req, file, cb) => {
    cb(null, `boardcard_${Date.now()}_${Math.random().toString(36).substring(2, 9)}${path.extname(file.originalname)}`);
  }
});

// 4. Review Image Upload Configuration
const reviewImgPath = path.join(__dirname, '../uploads/reviews');
if (!fs.existsSync(reviewImgPath)) {
  fs.mkdirSync(reviewImgPath, { recursive: true });
}

const reviewStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, reviewImgPath),
  filename: (req, file, cb) => {
    cb(null, `review_${Date.now()}_${Math.random().toString(36).substring(2, 9)}${path.extname(file.originalname)}`);
  }
});

// Create multer instances
const uploadCategoryImg = multer({ storage: categoryStorage, fileFilter });
const uploadVisitingCardImg = multer({ storage: visitingCardStorage, fileFilter });
const uploadBoardCardImg = multer({ storage: boardCardStorage, fileFilter });
const uploadReviewImg = multer({ storage: reviewStorage, fileFilter });

module.exports = {
  uploadCategoryImg,
  uploadVisitingCardImgSingle: uploadVisitingCardImg.single('image'),
  uploadVisitingCardImgMultiple: uploadVisitingCardImg.array('images', 10),
  uploadBoardCardImages: uploadBoardCardImg.array('images', 10),
  uploadReviewImage: uploadReviewImg.single('image') // Single image upload for reviews
};