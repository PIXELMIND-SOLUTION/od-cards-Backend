
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
// controllers/productController.js

// ✅ CREATE: Create new product
exports.createProduct = async (req, res) => {
  try {
    const {
      name, 
      category,
      productCategory,
      productName,
      subCategory, 
      description, 
      basePrice, 
      offeredPrice,
      minimumQuantity,
      maximumQuantity,
      printingTypes,
      laminationTypes,
      boardTypes,
      paperTypes,
      gsmOptions,
      sizes,
      demmySizes,
      boardThicknesses,
      specialOptions,
      availableMultipliers,
      boxPackingPrice,
      roundCornersPrice,
      bigSizeCardPrice,
      paddingPrice,
      creasingPrice,
      scoringPrice,
      shapeCuttingPrice,
      dieCutPrice,
      isActive,
      isInStock
    } = req.body;

    // Handle images
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => `/uploads/products/${file.filename}`);
    }

    const product = new Product({
      name,
      category,
      productCategory,
      productName,
      subCategory,
      description,
      images,
      basePrice: safeNumber(basePrice),
      offeredPrice: safeNumber(offeredPrice),
      minimumQuantity: safeNumber(minimumQuantity) || 1,
      maximumQuantity: safeNumber(maximumQuantity) || 20000,
      printingTypes: parseOptions(printingTypes),
      laminationTypes: parseOptions(laminationTypes),
      boardTypes: parseOptions(boardTypes),
      paperTypes: parseOptions(paperTypes),
      gsmOptions: parseOptions(gsmOptions),
      sizes: parseOptions(sizes),
      demmySizes: parseOptions(demmySizes),
      boardThicknesses: safeArray(boardThicknesses),
      specialOptions: parseOptions(specialOptions),
      availableMultipliers: parseOptions(availableMultipliers),
      features: {
        boxPacking: safeNumber(boxPackingPrice),
        roundCorners: safeNumber(roundCornersPrice),
        bigSizeCard: safeNumber(bigSizeCardPrice),
        padding: safeNumber(paddingPrice),
        creasing: safeNumber(creasingPrice),
        scoring: safeNumber(scoringPrice),
        shapeCutting: safeNumber(shapeCuttingPrice),
        dieCut: safeNumber(dieCutPrice)
      },
      isActive: isActive !== undefined ? parseBoolean(isActive) : true,
      isInStock: isInStock !== undefined ? parseBoolean(isInStock) : true
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product
    });
  } catch (error) {
    console.error("❌ CREATE PRODUCT ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
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


// controllers/visitingCardController.js

// ✅ CREATE: Create a new visiting card order
// ✅ CREATE: Create a new visiting card order (FIXED VERSION)
exports.createVisitingCards = async (req, res) => {
   try {
    const {
      productCategory,
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
      creasing,
      scoring,
      shapeCutting,
      dieCut,
      boardType,
      boardThickness,
      paperType,
      gsm,
      demmySize,
      specialOptions,
      specialNotes,
      images,
      price
    } = req.body;

    console.log("📝 Received Data for Visiting Card:");
    console.log("  - Product Category:", productCategory);
    console.log("  - Product Name:", productName);
    console.log("  - Board Thickness:", boardThickness);
    console.log("  - Size:", size);
    console.log("  - Board Type:", boardType);
    console.log("  - Paper Type:", paperType);
    console.log("  - GSM:", gsm);

    // Helper functions
    const parseBoolean = (val) => {
      if (typeof val === "boolean") return val;
      if (!val || val === "false" || val === "0" || val === "No") return false;
      if (typeof val === "string") {
        const s = val.toLowerCase().trim();
        return s === "yes" || s === "true" || s === "1" || s === "true";
      }
      return false;
    };

    const parseString = (val) => {
      if (!val) return '';
      if (Array.isArray(val)) {
        // Return first element if it's an array
        return val[0]?.toString().replace(/["']/g, '').trim() || '';
      }
      return val.toString().replace(/["']/g, '').trim();
    };

    const parseArray = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      
      if (typeof val === 'string') {
        // Handle JSON arrays
        if (val.trim().startsWith('[') && val.trim().endsWith(']')) {
          try {
            const parsed = JSON.parse(val);
            return Array.isArray(parsed) ? parsed : [parsed];
          } catch (e) {
            console.log("❌ JSON parse failed for:", val);
          }
        }
        
        // Handle comma-separated strings like "Gloss, Matt"
        let cleanVal = val.replace(/[\[\]"]/g, '');
        const items = cleanVal.split(',').map(item => item.trim()).filter(item => item);
        return items;
      }
      
      return [val];
    };

    // Parse specific fields - Convert arrays to strings for schema validation
    const parsedPrintingType = parseString(printingType);
    const parsedLaminationType = parseArray(laminationType); // Keep as array for laminationTypes
    const parsedSize = parseString(size); // Convert to string, not array
    const parsedBoardType = parseString(boardType); // Convert to string
    const parsedPaperType = parseString(paperType); // Convert to string
    const parsedGsm = parseString(gsm); // Convert to string
    const parsedSpecialOptions = parseArray(specialOptions);
    
    // Handle boardThickness - format properly
    let parsedBoardThickness = '';
    if (boardThickness) {
      parsedBoardThickness = parseString(boardThickness);
      // Format to match enum: "3mm" -> "3 mm"
      if (parsedBoardThickness.includes('mm')) {
        parsedBoardThickness = parsedBoardThickness.replace('mm', 'mm').replace(/(\d)(mm)/, '$1 $2');
      }
    }

    // Handle demmySize
    let parsedDemmySize = parseString(demmySize);

   

    // Handle images from uploaded files
    let imagePaths = [];
    if (req.files && req.files.length > 0) {
      imagePaths = req.files.map(file => `/uploads/visitingCards/${file.filename}`);
      console.log("📸 Saved images:", imagePaths);
    }

    // ========== PRICE CALCULATION ==========
    let finalPrice;
    
    if (price && !isNaN(parseFloat(price))) {
      // Use the price provided by client
      finalPrice = parseFloat(price);
      console.log("💰 Using client-provided price:", finalPrice);
    } else {
      // Try to find product and calculate price
      console.log("🔍 Looking up product for price calculation...");
      const product = await Product.findOne({
        productCategory: parseString(productCategory),
        productName: parseString(productName)
      }).lean();

      if (product) {
        console.log("✅ Found product:", product.name, "Base price:", product.basePrice);
        
        // Start with base price
        finalPrice = parseFloat(product.basePrice || 100) * (parseInt(quantity) || 1);
        
        // Add feature prices
        if (parseBoolean(boxPacking) && product.features?.boxPacking) {
          finalPrice += parseFloat(product.features.boxPacking);
        }
        if (parseBoolean(roundCorners) && product.features?.roundCorners) {
          finalPrice += parseFloat(product.features.roundCorners);
        }
        if (parseBoolean(bigSizeCard) && product.features?.bigSizeCard) {
          finalPrice += parseFloat(product.features.bigSizeCard);
        }
        if (parseBoolean(padding) && product.features?.padding) {
          finalPrice += parseFloat(product.features.padding);
        }
        if (parseBoolean(creasing) && product.features?.creasing) {
          finalPrice += parseFloat(product.features.creasing);
        }
        if (parseBoolean(scoring) && product.features?.scoring) {
          finalPrice += parseFloat(product.features.scoring);
        }
        if (parseBoolean(shapeCutting) && product.features?.shapeCutting) {
          finalPrice += parseFloat(product.features.shapeCutting);
        }
        if (parseBoolean(dieCut) && product.features?.dieCut) {
          finalPrice += parseFloat(product.features.dieCut);
        }
        
        // Add option prices
        const addOptionPrice = (options, selectedValue) => {
          if (!options || !selectedValue) return 0;
          const option = options.find(opt => opt.name === selectedValue);
          return option ? parseFloat(option.price || 0) : 0;
        };
        
        // Add printing type price
        if (parsedPrintingType && product.printingTypes) {
          const printingPrice = addOptionPrice(product.printingTypes, parsedPrintingType);
          finalPrice += printingPrice;
        }
        
        // Add lamination prices
        if (parsedLaminationType.length > 0 && product.laminationTypes) {
          parsedLaminationType.forEach(lamination => {
            const laminationPrice = addOptionPrice(product.laminationTypes, lamination);
            finalPrice += laminationPrice;
          });
        }
        
        console.log("💰 Calculated price:", finalPrice);
      } else {
        // Fallback to default calculation
        console.log("⚠️ Product not found, using default calculation");
        finalPrice = 100 * (parseInt(quantity) || 1);
      }
    }
    
    // Ensure price is valid number
    if (isNaN(finalPrice) || finalPrice <= 0) {
      finalPrice = 100 * (parseInt(quantity) || 1);
    }
    
    console.log("💰 Final price:", finalPrice);

    // Create visiting card order
    const newVisitingCard = new VisitingCardOrder({
      productCategory: parseString(productCategory),
      productName: parseString(productName),
      printingType: parsedPrintingType,
      quantity: parseInt(quantity) || 1,
      laminationType: parsedLaminationType, // This should remain as array
      boxPacking: parseBoolean(boxPacking),
      roundCorners: parseBoolean(roundCorners),
      bigSizeCard: parseBoolean(bigSizeCard),
      cardSizeMultiplier: parseInt(cardSizeMultiplier) || 1,
      size: parsedSize, // This should be a string, not array
      padding: parseBoolean(padding),
      creasing: parseBoolean(creasing),
      scoring: parseBoolean(scoring),
      shapeCutting: parseBoolean(shapeCutting),
      dieCut: parseBoolean(dieCut),
      boardType: parsedBoardType, // This should be a string, not array
      boardThickness: parsedBoardThickness,
      paperType: parsedPaperType, // This should be a string, not array
      gsm: parsedGsm, // This should be a string, not array
      demmySize: parsedDemmySize,
      specialOptions: parsedSpecialOptions,
      specialNotes: parseString(specialNotes),
      images: imagePaths,
      price: finalPrice,
      deliveryPrice: 50,
      totalPrice: finalPrice + 50,
      orderStatus: 'pending'
    });

    console.log("📋 Visiting Card to save:", JSON.stringify(newVisitingCard, null, 2));

    // Validate before saving
    await newVisitingCard.validate();

    await newVisitingCard.save();

    console.log("✅ Visiting Card saved successfully with ID:", newVisitingCard._id);

    return res.status(201).json({
      success: true,
      message: "Visiting card created successfully",
      data: newVisitingCard
    });

  } catch (error) {
    console.error("❌ Error creating visiting card:", error);
    console.error("❌ Stack trace:", error.stack);
    
    // Provide more specific error messages
    let errorMessage = "Server error while creating visiting card.";
    if (error.name === 'ValidationError') {
      errorMessage = `Validation error: ${Object.values(error.errors).map(e => e.message).join(', ')}`;
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: error.message
    });
  }
};

// ✅ READ: Get all visiting card orders
exports.getAllVisitingCards = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      productCategory, 
      productName,
      status 
    } = req.query;
    
    const filter = {};
    
    if (productCategory) filter.productCategory = productCategory;
    if (productName) filter.productName = productName;
    if (status) filter.orderStatus = status;
    
    const skip = (page - 1) * limit;
    
    const visitingCards = await VisitingCardOrder.find(filter)
      .populate('userId', 'name email mobile')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await VisitingCardOrder.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    if (!visitingCards.length) {
      return res.status(200).json({
        success: true,
        message: "No visiting cards found",
        data: [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages
        }
      });
    }

    res.status(200).json({
      success: true,
      message: "All visiting cards fetched successfully",
      data: visitingCards,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error("Error fetching visiting cards:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error", 
      error: error.message 
    });
  }
};

// ✅ READ: Get single visiting card by ID
exports.getSingleVisitingCard = async (req, res) => {
  try {
    const { id } = req.params;
    
    const visitingCard = await VisitingCardOrder.findById(id)
      .populate('userId', 'name email mobile location');
    
    if (!visitingCard) {
      return res.status(404).json({ 
        success: false, 
        message: "Visiting card not found" 
      });
    }

    res.status(200).json({
      success: true,
      message: "Visiting card fetched successfully",
      data: visitingCard,
    });
  } catch (error) {
    console.error("Error fetching visiting card by ID:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error", 
      error: error.message 
    });
  }
};

// // ✅ READ: Get visiting cards by user ID
// exports.getVisitingCardsByUserId = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const { page = 1, limit = 10, status } = req.query;
    
//     const filter = { userId };
//     if (status) filter.orderStatus = status;
    
//     const skip = (page - 1) * limit;
    
//     const visitingCards = await VisitingCardOrder.find(filter)
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(parseInt(limit));
    
//     const total = await VisitingCardOrder.countDocuments(filter);
//     const totalPages = Math.ceil(total / limit);

//     res.status(200).json({
//       success: true,
//       message: "User's visiting cards fetched successfully",
//       data: visitingCards,
//       pagination: {
//         page: parseInt(page),
//         limit: parseInt(limit),
//         total,
//         totalPages
//       }
//     });
//   } catch (error) {
//     console.error("Error fetching user's visiting cards:", error);
//     res.status(500).json({ 
//       success: false, 
//       message: "Internal server error", 
//       error: error.message 
//     });
//   }
// };

// // ✅ UPDATE: Update visiting card by ID
// exports.updateVisitingCard = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updateData = req.body;

//     // Parse boolean fields
//     const parseBoolean = (val) => {
//       if (typeof val === "boolean") return val;
//       if (val === undefined || val === null) return undefined;
//       const s = val.toString().toLowerCase();
//       return s === "yes" || s === "true" || s === "1";
//     };

//     const parseArray = (val) => {
//       if (val === undefined || val === null) return undefined;
//       if (Array.isArray(val)) return val;
//       return [val];
//     };

//     // Prepare update object
//     const updateObject = {};
    
//     // Handle each field
//     const fields = [
//       'productCategory', 'productName', 'printingType', 'quantity',
//       'boardThickness', 'demmySize', 'specialNotes'
//     ];
    
//     fields.forEach(field => {
//       if (updateData[field] !== undefined) {
//         updateObject[field] = updateData[field];
//       }
//     });

//     // Handle boolean fields
//     const booleanFields = [
//       'boxPacking', 'roundCorners', 'bigSizeCard', 'padding',
//       'creasing', 'scoring', 'shapeCutting', 'dieCut'
//     ];
    
//     booleanFields.forEach(field => {
//       if (updateData[field] !== undefined) {
//         updateObject[field] = parseBoolean(updateData[field]);
//       }
//     });

//     // Handle array fields
//     const arrayFields = [
//       'laminationType', 'size', 'boardType', 'paperType',
//       'gsm', 'specialOptions', 'images'
//     ];
    
//     arrayFields.forEach(field => {
//       if (updateData[field] !== undefined) {
//         updateObject[field] = parseArray(updateData[field]);
//       }
//     });

//     // Handle custom size
//     if (updateData.customSize !== undefined) {
//       if (typeof updateData.customSize === 'object') {
//         updateObject.customSize = updateData.customSize;
//       } else if (typeof updateData.customSize === 'string') {
//         try {
//           updateObject.customSize = JSON.parse(updateData.customSize);
//         } catch (e) {
//           const dimensions = updateData.customSize.split('x').map(d => parseInt(d.trim()));
//           if (dimensions.length === 2) {
//             updateObject.customSize = {
//               height: dimensions[0],
//               width: dimensions[1],
//               unit: 'inches'
//             };
//           }
//         }
//       }
//     }

//     // Handle card size multiplier
//     if (updateData.cardSizeMultiplier !== undefined) {
//       updateObject.cardSizeMultiplier = Number(updateData.cardSizeMultiplier) || 1;
//     }

//     // Handle price update
//     if (updateData.price !== undefined) {
//       updateObject.price = Number(updateData.price) || 0;
//       updateObject.totalPrice = updateObject.price + (updateObject.deliveryPrice || 50);
//     }

//     // Update timestamp
//     updateObject.updatedAt = Date.now();

//     const updatedCard = await VisitingCardOrder.findByIdAndUpdate(
//       id,
//       updateObject,
//       { new: true, runValidators: true }
//     );

//     if (!updatedCard) {
//       return res.status(404).json({ 
//         success: false, 
//         message: "Visiting card not found" 
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Visiting card updated successfully",
//       data: updatedCard
//     });
//   } catch (error) {
//     console.error("Error updating visiting card:", error);
//     res.status(500).json({ 
//       success: false, 
//       message: "Internal server error", 
//       error: error.message 
//     });
//   }
// };

// // ✅ DELETE: Delete visiting card by ID
// exports.deleteVisitingCard = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const deletedCard = await VisitingCardOrder.findByIdAndDelete(id);

//     if (!deletedCard) {
//       return res.status(404).json({ 
//         success: false, 
//         message: "Visiting card not found" 
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Visiting card deleted successfully",
//       data: deletedCard
//     });
//   } catch (error) {
//     console.error("Error deleting visiting card:", error);
//     res.status(500).json({ 
//       success: false, 
//       message: "Internal server error", 
//       error: error.message 
//     });
//   }
// };

// // ✅ DELETE: Delete multiple visiting cards
// exports.deleteMultipleVisitingCards = async (req, res) => {
//   try {
//     const { ids } = req.body;

//     if (!Array.isArray(ids) || ids.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Please provide an array of IDs to delete"
//       });
//     }

//     const result = await VisitingCardOrder.deleteMany({
//       _id: { $in: ids }
//     });

//     if (result.deletedCount === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "No visiting cards found to delete"
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: `${result.deletedCount} visiting card(s) deleted successfully`
//     });
//   } catch (error) {
//     console.error("Error deleting multiple visiting cards:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message
//     });
//   }
// };

// // ✅ UPDATE: Update visiting card status
// exports.updateVisitingCardStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;

//     const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
    
//     if (!status || !validStatuses.includes(status)) {
//       return res.status(400).json({
//         success: false,
//         message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
//       });
//     }

//     const updatedCard = await VisitingCardOrder.findByIdAndUpdate(
//       id,
//       { 
//         orderStatus: status,
//         updatedAt: Date.now()
//       },
//       { new: true }
//     );

//     if (!updatedCard) {
//       return res.status(404).json({
//         success: false,
//         message: "Visiting card not found"
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: `Visiting card status updated to ${status}`,
//       data: updatedCard
//     });
//   } catch (error) {
//     console.error("Error updating visiting card status:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message
//     });
//   }
// };

// // ✅ SEARCH: Search visiting cards
// exports.searchVisitingCards = async (req, res) => {
//   try {
//     const { query } = req.query;
//     const { page = 1, limit = 10 } = req.query;
    
//     if (!query) {
//       return res.status(400).json({
//         success: false,
//         message: "Search query is required"
//       });
//     }

//     const skip = (page - 1) * limit;
    
//     const searchResults = await VisitingCardOrder.find({
//       $or: [
//         { productCategory: { $regex: query, $options: 'i' } },
//         { productName: { $regex: query, $options: 'i' } },
//         { specialNotes: { $regex: query, $options: 'i' } },
//         { 'userId.name': { $regex: query, $options: 'i' } }
//       ]
//     })
//     .populate('userId', 'name email mobile')
//     .sort({ createdAt: -1 })
//     .skip(skip)
//     .limit(parseInt(limit));
    
//     const total = await VisitingCardOrder.countDocuments({
//       $or: [
//         { productCategory: { $regex: query, $options: 'i' } },
//         { productName: { $regex: query, $options: 'i' } },
//         { specialNotes: { $regex: query, $options: 'i' } },
//         { 'userId.name': { $regex: query, $options: 'i' } }
//       ]
//     });
    
//     const totalPages = Math.ceil(total / limit);

//     res.status(200).json({
//       success: true,
//       message: "Search results fetched successfully",
//       data: searchResults,
//       pagination: {
//         page: parseInt(page),
//         limit: parseInt(limit),
//         total,
//         totalPages
//       }
//     });
//   } catch (error) {
//     console.error("Error searching visiting cards:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message
//     });
//   }
// };

// // ✅ STATS: Get visiting card statistics
// exports.getVisitingCardStats = async (req, res) => {
//   try {
//     const stats = await VisitingCardOrder.aggregate([
//       {
//         $group: {
//           _id: null,
//           totalOrders: { $sum: 1 },
//           totalRevenue: { $sum: "$totalPrice" },
//           averageOrderValue: { $avg: "$totalPrice" },
//           pendingOrders: {
//             $sum: { $cond: [{ $eq: ["$orderStatus", "pending"] }, 1, 0] }
//           },
//           processingOrders: {
//             $sum: { $cond: [{ $eq: ["$orderStatus", "processing"] }, 1, 0] }
//           },
//           completedOrders: {
//             $sum: { $cond: [{ $eq: ["$orderStatus", "completed"] }, 1, 0] }
//           },
//           cancelledOrders: {
//             $sum: { $cond: [{ $eq: ["$orderStatus", "cancelled"] }, 1, 0] }
//           }
//         }
//       }
//     ]);

//     // Get orders by product category
//     const categoryStats = await VisitingCardOrder.aggregate([
//       {
//         $group: {
//           _id: "$productCategory",
//           count: { $sum: 1 },
//           totalRevenue: { $sum: "$totalPrice" }
//         }
//       },
//       { $sort: { count: -1 } }
//     ]);

//     // Get recent orders
//     const recentOrders = await VisitingCardOrder.find()
//       .sort({ createdAt: -1 })
//       .limit(5)
//       .populate('userId', 'name email');

//     res.status(200).json({
//       success: true,
//       message: "Statistics fetched successfully",
//       data: {
//         overview: stats[0] || {},
//         categories: categoryStats,
//         recentOrders
//       }
//     });
//   } catch (error) {
//     console.error("Error fetching statistics:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message
//     });
//   }
// };

// // ✅ FILTER: Filter visiting cards by date range
// exports.filterVisitingCardsByDate = async (req, res) => {
//   try {
//     const { startDate, endDate, page = 1, limit = 10 } = req.query;
    
//     if (!startDate || !endDate) {
//       return res.status(400).json({
//         success: false,
//         message: "Start date and end date are required"
//       });
//     }

//     const start = new Date(startDate);
//     const end = new Date(endDate);
//     end.setHours(23, 59, 59, 999);

//     const skip = (page - 1) * limit;
    
//     const filter = {
//       createdAt: {
//         $gte: start,
//         $lte: end
//       }
//     };

//     const visitingCards = await VisitingCardOrder.find(filter)
//       .populate('userId', 'name email mobile')
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(parseInt(limit));
    
//     const total = await VisitingCardOrder.countDocuments(filter);
//     const totalPages = Math.ceil(total / limit);

//     // Calculate revenue for the period
//     const revenueStats = await VisitingCardOrder.aggregate([
//       {
//         $match: filter
//       },
//       {
//         $group: {
//           _id: null,
//           totalRevenue: { $sum: "$totalPrice" },
//           totalOrders: { $sum: 1 },
//           averageOrderValue: { $avg: "$totalPrice" }
//         }
//       }
//     ]);

//     res.status(200).json({
//       success: true,
//       message: "Visiting cards filtered by date successfully",
//       data: visitingCards,
//       stats: revenueStats[0] || {},
//       pagination: {
//         page: parseInt(page),
//         limit: parseInt(limit),
//         total,
//         totalPages
//       }
//     });
//   } catch (error) {
//     console.error("Error filtering visiting cards by date:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message
//     });
//   }
// };




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


