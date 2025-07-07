
const Product = require('../models/Product');
const VisitingCardOrder = require("../models/VisitingCardOrder")
const BoardVisitingCardOrder = require("../models/BoardVisitingCardOrder").default
const path = require('path');
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


exports.createVisitingCards = async (req, res) => {
  try {
    const {
      productCategory,
      category,
      productName,
      printingType,
      quantity = 500,
      laminationType,
      boxPacking = 'No',
      roundCorners = 'No',
      bigSizeCard = 'No',
      cardSizeMultiplier = 1,
      size,
      padding,
      boardType,
      boardThickness,
      specialOptions,
      specialNotes,
      paperType,
      gsm
    } = req.body;

    // ✅ Required fields validation
    if (!productCategory || !productName) {
      return res.status(400).json({ message: 'Product category and name are required' });
    }

    if (bigSizeCard === 'Yes' && (!cardSizeMultiplier || cardSizeMultiplier < 2 || cardSizeMultiplier > 30)) {
      return res.status(400).json({
        message: 'Invalid card size multiplier. It must be between 2 and 30 if bigSizeCard is Yes.'
      });
    }

    // ✅ Handle multiple image paths
    const imagePaths = req.files?.map(file =>
      path.join('uploads/visitingCards', file.filename)
    ) || [];

    const cardSizeLabel = bigSizeCard === 'Yes'
      ? `${cardSizeMultiplier} Card Size`
      : 'Standard';

    const visitingCardOrder = await VisitingCardOrder.create({
      productCategory,
      category,
      productName,
      printingType,
      quantity,
      laminationType,
      boxPacking: boxPacking === 'Yes',
      roundCorners: roundCorners === 'Yes',
      bigSizeCard: bigSizeCard === 'Yes',
      cardSizeMultiplier,
      cardSize: cardSizeLabel,
      size,
      padding,
      boardType,
      boardThickness,
      specialOptions,
      specialNotes,
      paperType,
      gsm,
      images: imagePaths
    });

    return res.status(201).json({
      message: 'Visiting card order created successfully',
      data: visitingCardOrder
    });

  } catch (error) {
    console.error('Error creating visiting card order:', error);
    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};


// ✅ GET all visiting card orders
exports.getAllVisitingCards = async (req, res) => {
  try {
    const orders = await VisitingCardOrder.find().sort({ createdAt: -1 }); // latest first
    res.status(200).json({
      message: 'All visiting card orders fetched successfully',
      data: orders
    });
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ✅ GET a single visiting card order by ID
exports.getSingleVisitingCard = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await VisitingCardOrder.findById(id);

    if (!order) {
      return res.status(404).json({ message: 'Visiting card order not found' });
    }

    res.status(200).json({
      message: 'Single visiting card order fetched successfully',
      data: order
    });
  } catch (error) {
    console.error('Error fetching single order:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


//board visiting cards

exports.createBoardVisitingCards = async (req, res) => {
  try {
    const {
      printingType,
      quantity,
      laminationType,
      roundCorners = 'No',
      bigSizeCard = 'No',
      cardSizeMultiplier = 1
    } = req.body;

    // Validate input
    if (!printingType || !quantity || !laminationType) {
      return res.status(400).json({ message: 'Printing type, quantity, and lamination type are required.' });
    }

    if (bigSizeCard === 'Yes' && (!cardSizeMultiplier || cardSizeMultiplier < 2 || cardSizeMultiplier > 30)) {
      return res.status(400).json({
        message: 'Invalid card size multiplier. It must be between 2 and 30 if bigSizeCard is Yes.'
      });
    }

    // Image upload handling
    const imagePaths = req.files?.map(file =>
      path.join('uploads/boardVisitingCards', file.filename)
    ) || [];

    const cardSizeLabel = bigSizeCard === 'Yes'
      ? `${cardSizeMultiplier} Card Size`
      : 'Standard';

    // Save to DB
    const boardCardOrder = await BoardVisitingCardOrder.create({
      productCategory: 'Board Visiting Cards (320 Gsm)',
      productName: 'Board Visiting Cards (320 Gsm)',
      printingType,
      quantity,
      laminationType,
      roundCorners: roundCorners === 'Yes',
      bigSizeCard: bigSizeCard === 'Yes',
      cardSizeMultiplier,
      cardSize: cardSizeLabel,
      images: imagePaths
    });

    return res.status(201).json({
      message: 'Board Visiting Card order created successfully',
      data: boardCardOrder
    });

  } catch (error) {
    console.error('Error creating board visiting card order:', error);
    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};


exports.getAllBoardVisitingCards = async (req, res) => {
  try {
    const orders = await BoardVisitingCardOrder.find().sort({ createdAt: -1 });

    return res.status(200).json({
      message: 'All board visiting card orders retrieved successfully',
      data: orders
    });
  } catch (error) {
    console.error('Error fetching board visiting card orders:', error);
    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};



exports.getBoardVisitingCardById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await BoardVisitingCardOrder.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Board visiting card order not found' });
    }

    return res.status(200).json({
      message: 'Board visiting card order retrieved successfully',
      data: order
    });
  } catch (error) {
    console.error('Error fetching board visiting card order:', error);
    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};


//get all 

exports.getTrumpVisitingCardOrders = async (req, res) => {
  try {
    const productCategory = "Trump Visiting Cards (Synthetic)";

    const orders = await VisitingCardOrder.find({ productCategory });

    if (orders.length === 0) {
      return res.status(404).json({
        message: `No orders found for product category: ${productCategory}`
      });
    }

    return res.status(200).json({
      message: `Orders for product category: ${productCategory}`,
      data: orders
    });

  } catch (error) {
    console.error('Error fetching Trump Visiting Cards (Synthetic) orders:', error);
    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};




exports.getTrumpBothSidePrintOrders = async (req, res) => {
  try {
    const productCategory = "Trump Visiting Cards (Synthetic)";
    const productName = "Trump (Synthetic) Both Side";

    const orders = await VisitingCardOrder.find({
      productCategory,
      productName
    });

    if (orders.length === 0) {
      return res.status(404).json({
        message: `No orders found for product: ${productName} in category: ${productCategory}`
      });
    }

    return res.status(200).json({
      message: `Orders for ${productName} under category: ${productCategory}`,
      data: orders
    });

  } catch (error) {
    console.error('Error fetching Trump Both Side Print (B&B) orders:', error);
    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};




exports.getBoardVisitingCardOrders = async (req, res) => {
  try {
    const productCategory = "Board Visiting Cards (320 Gsm)";
    const productName = "Board Visiting Cards (320 Gsm)";

    const orders = await VisitingCardOrder.find({ productCategory, productName });

    if (!orders || orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No orders found for category: ${productCategory} and product: ${productName}`
      });
    }

    return res.status(200).json({
      success: true,
      message: `Orders found for category: ${productCategory} and product: ${productName}`,
      data: orders
    });

  } catch (error) {
    console.error('Error fetching board visiting card orders:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};




exports.getPocketCalenderOrders = async (req, res) => {
  try {
    const productCategory = "Pocket Calenders Board ( 320 Gsm)";
    const productName = "Pocket Calenders";

    const orders = await VisitingCardOrder.find({ productCategory, productName });

    if (!orders || orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No orders found for category: ${productCategory} and product: ${productName}`
      });
    }

    return res.status(200).json({
      success: true,
      message: `Orders found for category: ${productCategory} and product: ${productName}`,
      data: orders
    });

  } catch (error) {
    console.error('Error fetching pocket calender orders:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};



exports.getBoardMixingJobsOrders = async (req, res) => {
  try {
    const productCategory = "Mixing Jobs";
    

    const orders = await VisitingCardOrder.find({ productCategory });

    if (!orders || orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No orders found for category: ${productCategory}`
      });
    }

    return res.status(200).json({
      success: true,
      message: `Orders retrieved for category: ${productCategory}`,
      data: orders
    });

  } catch (error) {
    console.error('Error fetching board mixing jobs orders:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};




// ✅ Controller: Special Board Visiting Cards
exports.getSpecialBoardVisitingCards = async (req, res) => {
  try {
    const orders = await VisitingCardOrder.find({
      productCategory: 'Special Board Visiting Cards',
      productName: 'Special Board Visiting Cards'
    });
    res.status(200).json({ message: 'Special Board Visiting Cards orders', data: orders });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ✅ Controller: Spot Lamination Visiting Cards
exports.getSpotLaminationCards = async (req, res) => {
  try {
    const orders = await VisitingCardOrder.find({
      productCategory: 'Spot Lamination Visiting Cards',
      productName: 'Spot Lamination Cards'
    });
    res.status(200).json({ message: 'Spot Lamination Cards orders', data: orders });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ✅ Controller: Gold Foil Visiting Cards
exports.getGoldFoilCards = async (req, res) => {
  try {
    const orders = await VisitingCardOrder.find({
      productCategory: 'Gold Foil Visiting Cards',
      productName: 'Gold Foil Visiting Cards'
    });
    res.status(200).json({ message: 'Gold Foil Visiting Cards orders', data: orders });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ✅ Controller: 100 Gsm Bond Paper - Above Quantity
exports.getBondPaperAboveQty = async (req, res) => {
  try {
    const orders = await VisitingCardOrder.find({
      productCategory: '100 Gsm Bond Paper',
      productName: 'A4 Bond Ppaer 100 Gsm 1000 and Above Quantity'
    });
    res.status(200).json({ message: 'A4 Bond Paper 100 Gsm Above orders', data: orders });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ✅ Controller: 100 Gsm Bond Paper - Below Quantity
exports.getBondPaperBelowQty = async (req, res) => {
  try {
    const orders = await VisitingCardOrder.find({
      productCategory: '100 Gsm Bond Paper',
      productName: 'A4 Bond Ppaer 100 Gsm 500 and Blow Quantity'
    });
    res.status(200).json({ message: 'A4 Bond Paper 100 Gsm Below orders', data: orders });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ✅ Controller: Sticker Mixing Jobs
exports.getStickerMixingJobs = async (req, res) => {
  try {
    const orders = await VisitingCardOrder.find({
      productCategory: 'Sticker Mixing Jobs',
      productName: 'Sticker Mixing  ( Paper Sticker )'
    });
    res.status(200).json({ message: 'Sticker Mixing Jobs orders', data: orders });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ✅ Controller: Art Paper Mixing & Offset Jobs
exports.getOffsetMixingJobs = async (req, res) => {
  try {
    const orders = await VisitingCardOrder.find({
      productCategory: 'Art Paper Mixing & Offset Jobs',
      productName: 'Mixing and Offset Jobs All Gsms'
    });
    res.status(200).json({ message: 'Offset Mixing Jobs orders', data: orders });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ✅ Controller: Die Cutting Visiting Cards
exports.getDieCuttingCards = async (req, res) => {
  try {
    const orders = await VisitingCardOrder.find({
      productCategory: 'Die Cutting Visiting Cards',
      productName: 'Die Cutting Visiting Cards'
    });
    res.status(200).json({ message: 'Die Cutting Visiting Cards orders', data: orders });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ✅ Controller: Flute Board (Sunpack)
exports.getFluteBoardJobs = async (req, res) => {
  try {
    const orders = await VisitingCardOrder.find({
      productCategory: 'Flute Board ( Sunpack ) Printing',
      productName: 'Flute Board ( Sunpack )'
    });
    res.status(200).json({ message: 'Flute Board Jobs orders', data: orders });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ✅ Controller: Digital Prints
exports.getDigitalPrints = async (req, res) => {
  try {
    const orders = await VisitingCardOrder.find({
      productCategory: 'Digital Prints',
      productName: 'Digital Prints'
    });
    res.status(200).json({ message: 'Digital Prints orders', data: orders });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ✅ Controller: Sticker Digital Prints
exports.getStickerDigitalPrints = async (req, res) => {
  try {
    const orders = await VisitingCardOrder.find({
      productCategory: 'Digital Prints',
      productName: 'Sticker Digital Prints'
    });
    res.status(200).json({ message: 'Sticker Digital Prints orders', data: orders });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


//get all cards based on a category

exports.getAllCardsWithCat = async (req, res) => {
  try {
    const { category } = req.body;

    const filter = {};

    if (category) {
      filter.category = category;
    }

    const visitingCardOrders = await VisitingCardOrder.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      message: 'Visiting card orders fetched successfully',
      data: visitingCardOrders
    });
  } catch (error) {
    console.error('Error fetching visiting card orders:', error);
    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};


exports.updateCard = async (req, res) => {
  try {
    const { id } = req.params;

    // Handle file uploads (optional)
    const imagePaths = req.files?.map(file =>
      path.join('uploads/visitingCards', file.filename)
    ) || [];

    const {
      productCategory,
      category,
      productName,
      printingType,
      quantity,
      laminationType,
      boxPacking,
      roundCorners,
      bigSizeCard,
      cardSizeMultiplier,
      size,
      padding,
      boardType,
      boardThickness,
      specialOptions,
      specialNotes,
      paperType,
      gsm
    } = req.body;

    // Validation
    if (!productCategory || !productName) {
      return res.status(400).json({ message: 'Product category and name are required' });
    }

    if (bigSizeCard === 'Yes' && (!cardSizeMultiplier || cardSizeMultiplier < 2 || cardSizeMultiplier > 30)) {
      return res.status(400).json({
        message: 'Invalid card size multiplier. It must be between 2 and 30 if bigSizeCard is Yes.'
      });
    }

    const cardSizeLabel = bigSizeCard === 'Yes'
      ? `${cardSizeMultiplier} Card Size`
      : 'Standard';

    const updatedOrder = await VisitingCardOrder.findByIdAndUpdate(
      id,
      {
        productCategory,
        category,
        productName,
        printingType,
        quantity,
        laminationType,
        boxPacking: boxPacking === 'Yes',
        roundCorners: roundCorners === 'Yes',
        bigSizeCard: bigSizeCard === 'Yes',
        cardSizeMultiplier,
        cardSize: cardSizeLabel,
        size,
        padding,
        boardType,
        boardThickness,
        specialOptions,
        specialNotes,
        paperType,
        gsm,
        ...(imagePaths.length > 0 && { images: imagePaths }) // Only update images if provided
      },
      { new: true } // Return updated document
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Visiting card order not found' });
    }

    return res.status(200).json({
      message: 'Visiting card order updated successfully',
      data: updatedOrder
    });

  } catch (error) {
    console.error('Error updating visiting card order:', error);
    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};


exports.deleteCard = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedOrder = await VisitingCardOrder.findByIdAndDelete(id);

    if (!deletedOrder) {
      return res.status(404).json({ message: 'Visiting card order not found' });
    }

    return res.status(200).json({
      message: 'Visiting card order deleted successfully',
      data: deletedOrder
    });

  } catch (error) {
    console.error('Error deleting visiting card order:', error);
    return res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};



