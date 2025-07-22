const Banner = require("../models/Banner");
const fs = require("fs");
const path = require("path");

exports.createBanner = async (req, res) => {
  try {
    const { title, name, content } = req.body;
    const images = req.files?.map((file) => file.filename) || [];

    const banner = new Banner({ title, name, content, images });
    await banner.save();
    res.status(201).json({ message: "Banner created successfully", banner });
  } catch (error) {
    console.error("Create error:", error);
    res.status(500).json({ message: "Failed to create banner" });
  }
};

exports.getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    res.json({ banners });
  } catch (error) {
    res.status(500).json({ message: "Error fetching banners" });
  }
};

exports.getBannerById = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });
    res.json({ banner });
  } catch (error) {
    res.status(500).json({ message: "Error fetching banner" });
  }
};

exports.updateBanner = async (req, res) => {
  try {
    const { title, name, content } = req.body;
    const images = req.files?.map((file) => file.filename) || [];

    const updated = await Banner.findByIdAndUpdate(
      req.params.id,
      { title, name, content, $push: { images: { $each: images } } },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Banner not found" });
    res.json({ message: "Banner updated", banner: updated });
  } catch (error) {
    res.status(500).json({ message: "Error updating banner" });
  }
};

exports.deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });

    // Delete files
    banner.images.forEach((img) => {
      const filePath = path.join(__dirname, "../uploads/banners/", img);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    await banner.deleteOne();
    res.json({ message: "Banner deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting banner" });
  }
};
