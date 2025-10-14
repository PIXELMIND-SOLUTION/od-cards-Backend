
const Product = require('../models/Product');
const VisitingCardOrder = require("../models/VisitingCardOrder")
const BoardVisitingCardOrder = require("../models/BoardVisitingCardOrder").default
const path = require('path');

// Helper to convert "Yes"/"No" or "true"/"false" strings to Boolean
// helpers.js
exports.parseBoolean = (val) => {
  if (typeof val === "boolean") return val;
  if (!val) return false;
  const s = val.toString().toLowerCase();
  return s === "yes" || s === "true";
};

exports.parseArray = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  return [val];
};
// ✅ Create Product
exports.createProduct = async (req, res) => {
  try {
    const {
      name, category, subCategory, description, basePrice, offeredPrice, quantity,
      printingTypes, laminationTypes, sizes, boardTypes, paperTypes, gsmOptions,
      boxPacking, roundCorners, bigSizeCard, creasing, padding, scoring, shapeCutting,
      specialOptions, specialNotes, cardSize, boardThickness,
      isBigCard, hasBoxPacking, hasRoundCorners, hasCreasing, hasPadding, hasScoring, hasShapeCutting
    } = req.body;

    // Handle uploaded images
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => `/uploads/visitingCards/${file.filename}`);
    }

    const product = new Product({
      name,
      category,
      subCategory,
      description,
      images,
      basePrice,
      price: basePrice,
      offeredPrice,
      quantity,
      printingTypes: printingTypes ? JSON.parse(printingTypes) : [],
      laminationTypes: laminationTypes ? JSON.parse(laminationTypes) : [],
      sizes: sizes ? JSON.parse(sizes) : [],
      boardTypes: boardTypes ? JSON.parse(boardTypes) : [],
      paperTypes: paperTypes ? JSON.parse(paperTypes) : [],
      gsmOptions: gsmOptions ? JSON.parse(gsmOptions) : [],
      boxPacking: boxPacking || 0,
      roundCorners: roundCorners || 0,
      bigSizeCard: bigSizeCard || 0,
      creasing: creasing || 0,
      padding: padding || 0,
      scoring: scoring || 0,
      shapeCutting: shapeCutting || 0,
      specialOptions: specialOptions ? JSON.parse(specialOptions) : [],
      specialNotes: specialNotes || '',
      cardSize,
      boardThickness,
      isBigCard: isBigCard || false,
      hasBoxPacking: hasBoxPacking || false,
      hasRoundCorners: hasRoundCorners || false,
      hasCreasing: hasCreasing || false,
      hasPadding: hasPadding || false,
      hasScoring: hasScoring || false,
      hasShapeCutting: hasShapeCutting || false
    });

    await product.save();
    return res.status(201).json({ success: true, message: 'Product created successfully', data: product });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// ✅ Get All Products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    if (!products || products.length === 0)
      return res.status(404).json({ success: false, message: 'No products found' });

    res.status(200).json({
      success: true,
      message: 'All products fetched successfully',
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get Product by ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product)
      return res.status(404).json({ success: false, message: 'Product not found' });

    res.status(200).json({
      success: true,
      message: 'Product fetched successfully',
      data: product,
    });
  } catch (error) {
    console.error('❌ Error fetching product by ID:', error);
    res.status(500).json({ success: false, message: error.message });
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


// Create Visiting Card Order
exports.createVisitingCards = async (req, res) => {
 try {
    const {
      productCategory,
      productName,
      category,
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
      gsm,
      images,
      price: clientPrice,
      // ✅ added missing optional fields
      creasing,
      scoring,
      shapeCutting
    } = req.body;

    // ✅ helper functions
    const parseBoolean = (val) => {
      if (typeof val === "boolean") return val;
      if (!val) return false;
      const s = val.toString().toLowerCase();
      return s === "yes" || s === "true";
    };

    const parseArray = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      return [val];
    };

    const parseNumberArray = (val) => parseArray(val).map((v) => Number(v) || 0);

    // ✅ Try fetching matching Product to calculate price
    let product = await Product.findOne({
      $or: [{ productName }, { category: productCategory }],
    }).lean();

    // ✅ Price calculation logic
    const findOptPrice = (arr, name) => {
      if (!Array.isArray(arr) || !name) return 0;
      const n = Array.isArray(name) ? name[0] : name;
      const match = arr.find((item) => {
        if (!item) return false;
        if (typeof item === "string") return item === n;
        return item.name && item.name.toString() === n.toString();
      });
      return match ? Number(match.price ?? 0) : 0;
    };

    const computePrice = (productDoc) => {
      if (!productDoc) return Number(clientPrice) || 0;

      let total = Number(productDoc.basePrice ?? productDoc.price ?? 0);

      total += findOptPrice(productDoc.printingTypes, printingType);
      parseArray(laminationType).forEach((l) => (total += findOptPrice(productDoc.laminationTypes, l)));
      parseArray(size).forEach((s) => (total += findOptPrice(productDoc.sizes, s)));
      parseArray(boardType).forEach((b) => (total += findOptPrice(productDoc.boardTypes, b)));
      parseArray(paperType).forEach((p) => (total += findOptPrice(productDoc.paperTypes, p)));
      parseArray(gsm).forEach((g) => (total += findOptPrice(productDoc.gsmOptions, g)));

      // ✅ add-on pricing (boolean)
      if (parseBoolean(boxPacking)) total += Number(productDoc.boxPacking ?? 0);
      if (parseBoolean(roundCorners)) total += Number(productDoc.roundCorners ?? 0);
      if (parseBoolean(bigSizeCard)) total += Number(productDoc.bigSizeCard ?? 0);
      if (parseBoolean(padding)) total += Number(productDoc.padding ?? 0);
      if (parseBoolean(creasing)) total += Number(productDoc.creasing ?? 0);
      if (parseBoolean(scoring)) total += Number(productDoc.scoring ?? 0);
      if (parseBoolean(shapeCutting)) total += Number(productDoc.shapeCutting ?? 0);

      // ✅ special options
      const userSpecialOptions = parseArray(specialOptions);
      if (Array.isArray(productDoc.specialOptions) && productDoc.specialOptions.length > 0) {
        userSpecialOptions.forEach((opt) => {
          const found = productDoc.specialOptions.find(
            (so) => so && (so.name === opt || so === opt)
          );
          if (found) total += Number(found.price ?? 0);
        });
      }

      return total;
    };

    const finalPrice = computePrice(product);

    // ✅ Build and save new order
    const newOrder = new VisitingCardOrder({
      productCategory,
      productName,
      category,
      printingType: Array.isArray(printingType) ? printingType[0] : printingType,
      quantity: parseNumberArray(quantity),
      laminationType: parseArray(laminationType),
      boxPacking: parseBoolean(boxPacking),
      roundCorners: parseBoolean(roundCorners),
      bigSizeCard: parseBoolean(bigSizeCard),
      cardSizeMultiplier: Number(cardSizeMultiplier) || 1,
      size: parseArray(size),
      padding: parseBoolean(padding),
      boardType: parseArray(boardType),
      boardThickness: Array.isArray(boardThickness)
        ? boardThickness[0]
        : boardThickness,
      specialOptions: Array.isArray(specialOptions)
        ? specialOptions[0]
        : specialOptions,
      specialNotes: Array.isArray(specialNotes)
        ? specialNotes[0]
        : specialNotes,
      paperType: parseArray(paperType),
      gsm: parseArray(gsm),
      images: parseArray(images),
      creasing: parseBoolean(creasing),
      scoring: parseBoolean(scoring),
      shapeCutting: parseBoolean(shapeCutting),
      price: finalPrice,
    });

    await newOrder.save();

    return res.status(201).json({
      success: true,
      message: "Visiting card order created successfully",
      data: newOrder,
    });
  } catch (error) {
    console.error("❌ Error creating visiting card order:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating visiting card order.",
      error: error.message,
    });
  }
};
// ✅ GET all visiting card orders
exports.getAllVisitingCards = async (req, res) => {
  try {
    const visitingCards = await VisitingCardOrder.find().sort({ createdAt: -1 });

    if (!visitingCards.length) {
      return res.status(404).json({ success: false, message: "No visiting cards found" });
    }

    res.status(200).json({
      success: true,
      message: "All visiting cards fetched successfully",
      count: visitingCards.length,
      data: visitingCards,
    });
  } catch (error) {
    console.error("Error fetching visiting cards:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// ✅ GET a single visiting card order by ID
exports.getSingleVisitingCard = async (req, res) => {
  try {
    const { id } = req.params;
    const visitingCard = await VisitingCardOrder.findById(id);

    if (!visitingCard) {
      return res.status(404).json({ success: false, message: "Visiting card not found" });
    }

    res.status(200).json({
      success: true,
      message: "Visiting card fetched successfully",
      data: visitingCard,
    });
  } catch (error) {
    console.error("Error fetching visiting card by ID:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
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
      cardSizeMultiplier = 1,
    } = req.body;

    if (!printingType || !quantity || !laminationType) {
      return res.status(400).json({ message: 'Printing type, quantity, and lamination type are required.' });
    }

    if (bigSizeCard === 'Yes' && (!cardSizeMultiplier || cardSizeMultiplier < 2 || cardSizeMultiplier > 30)) {
      return res.status(400).json({
        message: 'Invalid card size multiplier. It must be between 2 and 30 if bigSizeCard is Yes.'
      });
    }

    const imagePaths = req.files?.map(file => path.join('uploads/boardVisitingCards', file.filename)) || [];
    const cardSizeLabel = bigSizeCard === 'Yes' ? `${cardSizeMultiplier} Card Size` : 'Standard';

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
    const {
      productCategory,
      productName,
      category,
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
      gsm,
      images,
      price: clientPrice,
      creasing,
      scoring,
      shapeCutting
    } = req.body;

    const parseBoolean = (val) => {
      if (typeof val === "boolean") return val;
      if (!val) return false;
      const s = val.toString().toLowerCase();
      return s === "yes" || s === "true";
    };

    const parseArray = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      return [val];
    };

    const parseNumberArray = (val) => parseArray(val).map((v) => Number(v) || 0);

    let product = await Product.findOne({
      $or: [{ productName }, { category: productCategory }],
    }).lean();

    const findOptPrice = (arr, name) => {
      if (!Array.isArray(arr) || !name) return 0;
      const n = Array.isArray(name) ? name[0] : name;
      const match = arr.find((item) => {
        if (!item) return false;
        if (typeof item === "string") return item === n;
        return item.name && item.name.toString() === n.toString();
      });
      return match ? Number(match.price ?? 0) : 0;
    };

    const computePrice = (productDoc) => {
      if (!productDoc) return Number(clientPrice) || 0;

      let total = Number(productDoc.basePrice ?? productDoc.price ?? 0);

      total += findOptPrice(productDoc.printingTypes, printingType);
      parseArray(laminationType).forEach((l) => (total += findOptPrice(productDoc.laminationTypes, l)));
      parseArray(size).forEach((s) => (total += findOptPrice(productDoc.sizes, s)));
      parseArray(boardType).forEach((b) => (total += findOptPrice(productDoc.boardTypes, b)));
      parseArray(paperType).forEach((p) => (total += findOptPrice(productDoc.paperTypes, p)));
      parseArray(gsm).forEach((g) => (total += findOptPrice(productDoc.gsmOptions, g)));

      if (parseBoolean(boxPacking)) total += Number(productDoc.boxPacking ?? 0);
      if (parseBoolean(roundCorners)) total += Number(productDoc.roundCorners ?? 0);
      if (parseBoolean(bigSizeCard)) total += Number(productDoc.bigSizeCard ?? 0);
      if (parseBoolean(padding)) total += Number(productDoc.padding ?? 0);
      if (parseBoolean(creasing)) total += Number(productDoc.creasing ?? 0);
      if (parseBoolean(scoring)) total += Number(productDoc.scoring ?? 0);
      if (parseBoolean(shapeCutting)) total += Number(productDoc.shapeCutting ?? 0);

      const userSpecialOptions = parseArray(specialOptions);
      if (Array.isArray(productDoc.specialOptions) && productDoc.specialOptions.length > 0) {
        userSpecialOptions.forEach((opt) => {
          const found = productDoc.specialOptions.find(
            (so) => so && (so.name === opt || so === opt)
          );
          if (found) total += Number(found.price ?? 0);
        });
      }

      return total;
    };

    const finalPrice = computePrice(product);

    const updatedOrder = await VisitingCardOrder.findByIdAndUpdate(
      id,
      {
        productCategory,
        productName,
        category,
        printingType: Array.isArray(printingType) ? printingType[0] : printingType,
        quantity: parseNumberArray(quantity),
        laminationType: parseArray(laminationType),
        boxPacking: parseBoolean(boxPacking),
        roundCorners: parseBoolean(roundCorners),
        bigSizeCard: parseBoolean(bigSizeCard),
        cardSizeMultiplier: Number(cardSizeMultiplier) || 1,
        size: parseArray(size),
        padding: parseBoolean(padding),
        boardType: parseArray(boardType),
        boardThickness: Array.isArray(boardThickness)
          ? boardThickness[0]
          : boardThickness,
        specialOptions: Array.isArray(specialOptions)
          ? specialOptions[0]
          : specialOptions,
        specialNotes: Array.isArray(specialNotes)
          ? specialNotes[0]
          : specialNotes,
        paperType: parseArray(paperType),
        gsm: parseArray(gsm),
        images: parseArray(images),
        creasing: parseBoolean(creasing),
        scoring: parseBoolean(scoring),
        shapeCutting: parseBoolean(shapeCutting),
        price: finalPrice,
      },
      { new: true }
    );

    if (!updatedOrder)
      return res.status(404).json({ success: false, message: "Order not found" });

    res.status(200).json({
      success: true,
      message: "Visiting card order updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("❌ Error updating visiting card order:", error);
    res.status(500).json({ success: false, message: error.message });
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

// ===================== Delete Visiting Card By ID =====================
exports.deleteVisitingCardById = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedVisitingCard = await VisitingCardOrder.findByIdAndDelete(id);

    if (!deletedVisitingCard) {
      return res.status(404).json({ success: false, message: "Visiting card not found" });
    }

    res.status(200).json({
      success: true,
      message: "Visiting card deleted successfully",
      data: deletedVisitingCard,
    });
  } catch (error) {
    console.error("Error deleting visiting card:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};


// ✅ UPDATE Product by ID (same logic as create)
exports.updateProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, category, subCategory, description, basePrice, offeredPrice, quantity,
      printingTypes, laminationTypes, sizes, boardTypes, paperTypes, gsmOptions,
      boxPacking, roundCorners, bigSizeCard, creasing, padding, scoring, shapeCutting,
      specialOptions, specialNotes, cardSize, boardThickness,
      isBigCard, hasBoxPacking, hasRoundCorners, hasCreasing, hasPadding, hasScoring, hasShapeCutting
    } = req.body;

    // handle uploaded images
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => `/uploads/visitingCards/${file.filename}`);
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name,
        category,
        subCategory,
        description,
        images: images.length > 0 ? images : undefined, // keep old if not updated
        basePrice,
        price: basePrice,
        offeredPrice,
        quantity,
        printingTypes: printingTypes ? JSON.parse(printingTypes) : [],
        laminationTypes: laminationTypes ? JSON.parse(laminationTypes) : [],
        sizes: sizes ? JSON.parse(sizes) : [],
        boardTypes: boardTypes ? JSON.parse(boardTypes) : [],
        paperTypes: paperTypes ? JSON.parse(paperTypes) : [],
        gsmOptions: gsmOptions ? JSON.parse(gsmOptions) : [],
        boxPacking: boxPacking || 0,
        roundCorners: roundCorners || 0,
        bigSizeCard: bigSizeCard || 0,
        creasing: creasing || 0,
        padding: padding || 0,
        scoring: scoring || 0,
        shapeCutting: shapeCutting || 0,
        specialOptions: specialOptions ? JSON.parse(specialOptions) : [],
        specialNotes: specialNotes || '',
        cardSize,
        boardThickness,
        isBigCard: isBigCard || false,
        hasBoxPacking: hasBoxPacking || false,
        hasRoundCorners: hasRoundCorners || false,
        hasCreasing: hasCreasing || false,
        hasPadding: hasPadding || false,
        hasScoring: hasScoring || false,
        hasShapeCutting: hasShapeCutting || false
      },
      { new: true }
    );

    if (!updatedProduct)
      return res.status(404).json({ success: false, message: 'Product not found' });

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });
  } catch (error) {
    console.error('❌ Error updating product:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Delete Product
exports.deleteProduct = async (req, res) => {
   try {
    const { id } = req.params;

    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct)
      return res.status(404).json({ success: false, message: 'Product not found' });

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting product:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


