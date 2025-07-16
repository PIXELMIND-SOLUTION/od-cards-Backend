const express = require('express');
const router = express.Router();
const {
  createAbout,
  getAbout,
  updateAbout,
  deleteAbout
} = require('../controllers/aboutController');
const { uploadAboutImageSingle } = require('../middleware/upload');

router.post('/create-about', uploadAboutImageSingle, createAbout);
router.get('/about', getAbout);
router.put('/updateabout/:id', uploadAboutImageSingle, updateAbout);
router.delete('/deleteabout/:id', deleteAbout);

module.exports = router;
