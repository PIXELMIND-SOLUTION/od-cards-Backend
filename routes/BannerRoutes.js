const express = require("express");
const router = express.Router();
const bannerController = require("../controllers/BannerController");
const { uploadBannerImageMultiple } = require('../middleware/upload');

// Create banner
router.post("/create", uploadBannerImageMultiple, bannerController.createBanner);

// Get all banners
router.get("/getallbanners", bannerController.getAllBanners);

// Get single banner
router.get("/banner/:id", bannerController.getBannerById);

// Update banner
router.put("/updatebanner/:id", uploadBannerImageMultiple, bannerController.updateBanner);

// Delete banner
router.delete("/deletebanner/:id", bannerController.deleteBanner);

module.exports = router;
