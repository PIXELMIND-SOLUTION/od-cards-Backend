const multer = require("multer");

// ----------------------------
// MEMORY STORAGE (for Cloudinary)
// ----------------------------
const storage = multer.memoryStorage();

const upload = multer({ storage });

// Upload multiple images & one design file
// images[] = multiple photos
// design = single file
const uploadVisitingCardImgMultiple = upload.fields([
  { name: "images", maxCount: 30 }, 
  { name: "design", maxCount: 1 }
]);

module.exports = {
  uploadVisitingCardImgMultiple
};
