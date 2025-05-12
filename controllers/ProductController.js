const Product = require('../models/Product');

// ✅ Create Product
exports.createProduct = async (req, res) => {
  try {
    const { name, category, subCategory, images, quantity, price, offeredPrice, description } = req.body;

    if (!name || !category || !subCategory || !images || images.length === 0 || !price || !description) {
      return res.status(400).json({ message: 'Missing required fields: name, category, subCategory, images, price, or description.' });
    }



    const newProduct = new Product({
      name,
      category,
      subCategory,
      images,
      quantity,
      price,
      offeredPrice,
      description
    });

    const savedProduct = await newProduct.save();
    res.status(201).json({ message: 'Product created successfully.', product: savedProduct });
  } catch (error) {
    console.error('Error in createProduct:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ✅ Get All Products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json({ message: 'Products fetched successfully.', products });
  } catch (error) {
    console.error('Error in getAllProducts:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ✅ Get Product by ID
exports.getProductById = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    res.status(200).json({ message: 'Product fetched successfully.', product });
  } catch (error) {
    console.error('Error in getProductById:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ✅ Update Product
exports.updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const updates = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(productId, updates, { new: true });

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    res.status(200).json({ message: 'Product updated successfully.', product: updatedProduct });
  } catch (error) {
    console.error('Error in updateProduct:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// ✅ Delete Product
exports.deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    res.status(200).json({ message: 'Product deleted successfully.', product: deletedProduct });
  } catch (error) {
    console.error('Error in deleteProduct:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};


exports.getVisitingCardProducts = async (req, res) => {
  try {
    const products = await Product.find({ category: "Visiting Cards" }).sort({ createdAt: -1 });

    if (products.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No Visiting Card products found.',
        products: []
      });
    }

    res.status(200).json({
      success: true,
      message: 'Visiting Card products fetched successfully.',
      products
    });
  } catch (error) {
    console.error('Error in getVisitingCardProducts:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching Visiting Card products.',
      products: []
    });
  }
};
exports.getInvitationCardProducts = async (req, res) => {
  try {
    // Fetch products where category is "Invitation Cards"
    const products = await Product.find({ category: "Invitation Cards" }).sort({ createdAt: -1 });

    // Log the fetched products to see the data
    console.log("Fetched Products:", products);  // Add this line for debugging

    if (products.length === 0) {
      return res.status(404).json({ message: 'No Invitation Card products found.' });
    }

    // Return products if found
    res.status(200).json({ message: 'Invitation Card products fetched successfully.', products });
  } catch (error) {
    console.error('Error in getInvitationCardProducts:', error);
    res.status(500).json({ message: 'Server error while fetching Invitation Card products.' });
  }
};
