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

// Utility function to ensure directory exists
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// About Us Image Upload
const aboutImgPath = path.join(__dirname, '../uploads/about');
ensureDir(aboutImgPath);

const aboutStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, aboutImgPath),
  filename: (req, file, cb) => {
    cb(null, `about_${Date.now()}${path.extname(file.originalname)}`);
  }
});

// Card Category Image Upload
const cardCategoryImgPath = path.join(__dirname, '../uploads/cardCategories');
ensureDir(cardCategoryImgPath);

const cardCategoryStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, cardCategoryImgPath),
  filename: (req, file, cb) => {
    cb(null, `card_category_${Date.now()}${path.extname(file.originalname)}`);
  }
});

// Existing storage configs
const categoryImgPath = path.join(__dirname, '../uploads/categoryImg');
ensureDir(categoryImgPath);
const categoryStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, categoryImgPath),
  filename: (req, file, cb) => {
    cb(null, `category_${Date.now()}${path.extname(file.originalname)}`);
  }
});

const visitingCardPath = path.join(__dirname, '../uploads/visitingCards');
ensureDir(visitingCardPath);
const visitingCardStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, visitingCardPath),
  filename: (req, file, cb) => {
    cb(null, `visitingcard_${Date.now()}_${Math.random().toString(36).substring(2, 9)}${path.extname(file.originalname)}`);
  }
});

const boardCardPath = path.join(__dirname, '../uploads/boardVisitingCards');
ensureDir(boardCardPath);
const boardCardStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, boardCardPath),
  filename: (req, file, cb) => {
    cb(null, `boardcard_${Date.now()}_${Math.random().toString(36).substring(2, 9)}${path.extname(file.originalname)}`);
  }
});

const reviewImgPath = path.join(__dirname, '../uploads/reviews');
ensureDir(reviewImgPath);
const reviewStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, reviewImgPath),
  filename: (req, file, cb) => {
    cb(null, `review_${Date.now()}_${Math.random().toString(36).substring(2, 9)}${path.extname(file.originalname)}`);
  }
});


const faqImgPath = path.join(__dirname, '../uploads/faqs');
ensureDir(faqImgPath);

const faqImageStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, faqImgPath),
  filename: (req, file, cb) => {
    cb(null, `faq_${Date.now()}_${Math.random().toString(36).substring(2, 9)}${path.extname(file.originalname)}`);
  }
});



// Multer instances
const uploadAboutImage = multer({ storage: aboutStorage, fileFilter });
const uploadCardCategoryImage = multer({ storage: cardCategoryStorage, fileFilter });

const uploadFAQImage = multer({ storage: faqImageStorage, fileFilter });

const uploadCategoryImg = multer({ storage: categoryStorage, fileFilter });
const uploadVisitingCardImg = multer({ storage: visitingCardStorage, fileFilter });
const uploadBoardCardImg = multer({ storage: boardCardStorage, fileFilter });
const uploadReviewImg = multer({ storage: reviewStorage, fileFilter });

module.exports = {
  uploadCategoryImg,
  uploadVisitingCardImgSingle: uploadVisitingCardImg.single('image'),
  uploadVisitingCardImgMultiple: uploadVisitingCardImg.array('images', 10),
  uploadBoardCardImages: uploadBoardCardImg.array('images', 10),
  uploadReviewImage: uploadReviewImg.single('image'),

  // Added for About Us & Cards Section
  uploadAboutImageSingle: uploadAboutImage.single('image'),

  uploadCardCategoryImageSingle: uploadCardCategoryImage.single('image'),

  uploadCardCategoryImageSingle: uploadCardCategoryImage.single('image'),

  uploadFAQImageSingle: uploadFAQImage.single('image'), // Single image upload
  uploadFAQImageMultiple: uploadFAQImage.array('images', 10) // Multiple image upload

};
