const VisitingCardOrder = require("../models/VisitingCardOrder");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");
const mongoose = require("mongoose");
const UserSelectedCard = require("../models/visitingproduct");
const VisitingOrder = require("../models/VisitingOrder");
const VisitingCart = require("../models/VisitingCart");
const AdminCharge = require("../models/AdminCharge");

/* =====================================================
   🔒 SAFE NORMALIZERS (VERY IMPORTANT)
===================================================== */

// Normalize option fields (string ➜ object)
const normalizeOptionField = (field) => {
  if (field && typeof field === "object" && Array.isArray(field.options)) {
    return field;
  }

  if (typeof field === "string") {
    return {
      isEnabled: true,
      options: [{ label: field, price: 0 }]
    };
  }

  return { isEnabled: false, options: [] };
};

// Safe option finder
const findOption = (list, label) => {
  if (!label || !Array.isArray(list)) return null;
  const found = list.find(x => x.label === label);
  return found ? { label: found.label, price: found.price } : null;
};

const safePrice = (obj) => obj?.price ? Number(obj.price) : 0;

/* =====================================================
   ☁️ CLOUDINARY UPLOAD
===================================================== */

const uploadToCloudinary = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "auto" },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });

/* =====================================================
   🧠 HELPERS
===================================================== */

const dotNotationToNested = (obj) => {
  const result = {};
  for (const key in obj) {
    const keys = key.split(".");
    let cur = result;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!cur[keys[i]]) cur[keys[i]] = {};
      cur = cur[keys[i]];
    }
    cur[keys[keys.length - 1]] = obj[key];
  }
  return result;
};

const parseJSON = (val) => {
  try {
    return typeof val === "string" ? JSON.parse(val) : val;
  } catch {
    return val;
  }
};

const parseOptionsArray = (data) => {
  const parsed = parseJSON(data);
  if (!Array.isArray(parsed)) return [];
  return parsed.map(o => ({
    label: o.label,
    price: Number(o.price || 0)
  }));
};

/* =====================================================
   🟢 CREATE MASTER PRODUCT
===================================================== */

const createVisitingcards = async (req, res) => {
  try {
    const body = dotNotationToNested(req.body);
    const adminId = new mongoose.Types.ObjectId();

    let imageUrls = [];

    if (req.files?.length) {
      for (const file of req.files) {
        const upload = await uploadToCloudinary(
          file.buffer,
          "visiting/images"
          );
        imageUrls.push(upload.secure_url);
      }
    }

    const order = await VisitingCardOrder.create({
      category: { values: body.category?.values || "" },
      subCategory: { values: body.subCategory?.values || "" },
      productName: { values: body.productName?.values || "" },

      quantity: {
        isEnabled: body.quantity?.isEnabled === "true",
        values: parseJSON(body.quantity?.values) || []
      },

      printingType: {
        isEnabled: true,
        options: parseOptionsArray(body.printingType?.options)
      },

      laminationType: {
        isEnabled: true,
        options: parseOptionsArray(body.laminationType?.options)
      },

      features: {
        boxPacking: { options: parseOptionsArray(body.features?.boxPacking?.options) },
        roundCorners: { options: parseOptionsArray(body.features?.roundCorners?.options) },
        bigSizeCard: { options: parseOptionsArray(body.features?.bigSizeCard?.options) },
        padding: { options: parseOptionsArray(body.features?.padding?.options) },
        creasing: { options: parseOptionsArray(body.features?.creasing?.options) },
        scoring: { options: parseOptionsArray(body.features?.scoring?.options) },
        shapeCutting: { options: parseOptionsArray(body.features?.shapeCutting?.options) },
        dieCut: { options: parseOptionsArray(body.features?.dieCut?.options) }
      },

      size: { options: parseOptionsArray(body.size?.options) },
      demmySize: { options: parseOptionsArray(body.demmySize?.options) },

      boardType: { options: parseOptionsArray(body.boardType?.options) },
      boardThickness: { options: parseOptionsArray(body.boardThickness?.options) },
      paperType: { options: parseOptionsArray(body.paperType?.options) },
      gsm: { options: parseOptionsArray(body.gsm?.options) },
      specialOptions: { options: parseOptionsArray(body.specialOptions?.options) },

      images: { values: imageUrls },



      totalPrice: Number(body.totalPrice || 0),
      createdBy: adminId,
      status: body.status || "draft"
    });

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/* =====================================================
   📦 GET ALL (SAFE)
===================================================== */

const getAllVisitingcards = async (req, res) => {
  try {
    const orders = await VisitingCardOrder.find().lean();

    const safe = orders.map(o => ({
      ...o,
      printingType: normalizeOptionField(o.printingType),
      laminationType: normalizeOptionField(o.laminationType),
      size: normalizeOptionField(o.size),
      demmySize: normalizeOptionField(o.demmySize),
      boardType: normalizeOptionField(o.boardType),
      paperType: normalizeOptionField(o.paperType)
    }));

    res.json({ success: true, count: safe.length, data: safe });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};

/* =====================================================
   🔍 GET BY ID / FILTERS
===================================================== */

const getVisitingcardById = async (req, res) => {
  const data = await VisitingCardOrder.findById(req.params.id);
  data ? res.json({ success: true, data }) :
    res.status(404).json({ success: false, message: "Not found" });
};

const getByCategoryName = async (req, res) =>
  res.json({ success: true, data: await VisitingCardOrder.find({ "category.values": new RegExp(req.params.name, "i") }) });

const getBySubCategoryName = async (req, res) =>
  res.json({ success: true, data: await VisitingCardOrder.find({ "subCategory.values": new RegExp(req.params.name, "i") }) });

const getByProductName = async (req, res) =>
  res.json({ success: true, data: await VisitingCardOrder.find({ "productName.values": new RegExp(req.params.name, "i") }) });

/* =====================================================
   ✏️ UPDATE / DELETE
===================================================== */

const updateVisitingcard = async (req, res) => {
  const updated = await VisitingCardOrder.findByIdAndUpdate(req.params.id, req.body, { new: true });
  updated ? res.json({ success: true, data: updated }) :
    res.status(404).json({ success: false });
};

const deleteVisitingcard = async (req, res) => {
  const deleted = await VisitingCardOrder.findByIdAndDelete(req.params.id);
  deleted ? res.json({ success: true }) :
    res.status(404).json({ success: false });
};

/* =====================================================
   👤 USER SELECTS PRODUCT
===================================================== */
const createUserCard = async (req, res) => {
  try {
    /* ================= FORM DATA ================= */
    const form = dotNotationToNested(req.body);

    /* ================= MASTER PRODUCT ================= */
    const master = await VisitingCardOrder.findById(form.ProductId).lean();
    if (!master) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    /* ================= IMAGE UPLOAD ================= */
    let imageUrls = [];
    if (req.files?.length) {
      for (const file of req.files) {
        const upload = await uploadToCloudinary(
          file.buffer,
          "visiting/user-images"
        );
        imageUrls.push(upload.secure_url);
      }
    }

    /* ================= NORMALIZE OPTIONS ================= */
    const pt = normalizeOptionField(master.printingType);
    const lt = normalizeOptionField(master.laminationType);

    /* ================= SELECTED BASIC OPTIONS ================= */
    const selected = {
      quantity: Number(form.quantity || 1),
      printingType: findOption(pt.options, form.printingType),
      laminationType: findOption(lt.options, form.laminationType)
    };

    /* ================= SELECTED FEATURES ================= */
    const selectedFeatures = {};

    if (form.features && master.features) {
      for (const key in form.features) {
        if (master.features[key]?.options) {
          const option = findOption(
            master.features[key].options,
            form.features[key]
          );

          if (option) {
            selectedFeatures[key] = option;
          }
        }
      }
    }

    /* ================= PRICE CALCULATION ================= */
    let total =
      safePrice(selected.printingType) +
      safePrice(selected.laminationType);

    // ➕ add features price
    for (const key in selectedFeatures) {
      total += safePrice(selectedFeatures[key]);
    }

    total *= selected.quantity;

    /* ================= SAVE USER CARD ================= */
    const card = await UserSelectedCard.create({
      userId: form.userId,
      ProductId: form.ProductId,
      selectedOptions: {
        ...selected,
        features: selectedFeatures
      },
      images: imageUrls,
      totalPrice: total
    });

    /* ================= RESPONSE ================= */
    res.status(201).json({
      success: true,
      message: "User card created successfully",
      data: card
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create user card",
      error: error.message
    });
  }
};


const getAllUserCards = async (req, res) => {
  try {
    console.log("Fetching all user cards...");
    
    // Add timeout to the query
    const cards = await UserSelectedCard.find()
      .populate({
        path: "ProductId",
        select: "productName category subCategory images"
      })
      .populate({
        path: "userId",
        select: "name email phone"
      })
      .maxTimeMS(30000) // Increase timeout to 30 seconds
      .lean(); // Use lean() for faster queries

    console.log(`Found ${cards.length} user cards`);
    
    res.json({ 
      success: true, 
      count: cards.length, 
      data: cards 
    });
  } catch (e) {
    console.error("Error fetching user cards:", e);
    res.status(500).json({ 
      success: false, 
      error: e.message,
      message: "Failed to fetch user cards. Please try again."
    });
  }
};


const getUserCardById = async (req, res) => {
  const card = await UserSelectedCard.findById(req.params.id)
    .populate("ProductId");

  if (!card) {
    return res.status(404).json({ success: false, message: "Not found" });
  }

  res.json({ success: true, data: card });
};

const getUserCardsByUser = async (req, res) => {
  const cards = await UserSelectedCard.find({ userId: req.params.userId })
    .populate("ProductId");

  res.json({
    success: true,
    count: cards.length,
    data: cards
  });
};

const updateUserCard = async (req, res) => {
  try {
    const form = dotNotationToNested(req.body);

    const card = await UserSelectedCard.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ success: false, message: "Card not found" });
    }

    const master = await VisitingCardOrder.findById(card.ProductId).lean();

    // Replace images if new ones provided
    let imageUrls = card.images;
    if (req.files?.length) {
      imageUrls = [];
      for (const file of req.files) {
        const upload = await uploadToCloudinary(file.buffer, "visiting/user-images");
        imageUrls.push(upload.secure_url);
      }
    }

    const pt = normalizeOptionField(master.printingType);
    const lt = normalizeOptionField(master.laminationType);

    const selected = {
      quantity: Number(form.quantity || card.selectedOptions.quantity),
      printingType: findOption(pt.options, form.printingType) || card.selectedOptions.printingType,
      laminationType: findOption(lt.options, form.laminationType) || card.selectedOptions.laminationType
    };

    let total =
      safePrice(selected.printingType) +
      safePrice(selected.laminationType);

    total *= selected.quantity;

    card.selectedOptions = selected;
    card.images = imageUrls;
    card.totalPrice = total;

    await card.save();

    res.json({ success: true, data: card });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};

const deleteUserCard = async (req, res) => {
  const card = await UserSelectedCard.findByIdAndDelete(req.params.id);

  if (!card) {
    return res.status(404).json({ success: false, message: "Not found" });
  }

  res.json({ success: true, message: "Deleted successfully" });
};


// 1. ADD TO CART
/* =====================================================
   ADD TO CART (instructions as ARRAY)
===================================================== */
const addToCart = async (req, res) => {
 try {
    const { userSelectedCardId, quantity = 1 } = req.body;

    /* ---------- Validation ---------- */
    if (!userSelectedCardId) {
      return res.status(400).json({
        success: false,
        message: "userSelectedCardId is required"
      });
    }

    /* ---------- Fetch User Selected Card ---------- */
    const selectedCard = await UserSelectedCard.findById(userSelectedCardId)
      .populate("ProductId", "productName category subCategory images");

    if (!selectedCard) {
      return res.status(404).json({
        success: false,
        message: "Selected card not found"
      });
    }

    /* ---------- Price Calculation ---------- */
    const add = (v) => (v?.price ? Number(v.price) : 0);

    const calculateUnitPrice = (opt = {}) => {
      let price = 0;

      price += add(opt.printingType);
      price += add(opt.laminationType);
      price += add(opt.size);
      price += add(opt.demmySize);
      price += add(opt.cardSizeMultiplier);
      price += add(opt.boardType);
      price += add(opt.boardThickness);
      price += add(opt.paperType);
      price += add(opt.gsm);
      price += add(opt.specialOptions);

      if (opt.features) {
        price += add(opt.features.boxPacking);
        price += add(opt.features.roundCorners);
        price += add(opt.features.bigSizeCard);
        price += add(opt.features.padding);
        price += add(opt.features.creasing);
        price += add(opt.features.scoring);
        price += add(opt.features.shapeCutting);
        price += add(opt.features.dieCut);
      }

      return price;
    };

    const unitPrice = calculateUnitPrice(selectedCard.selectedOptions);
    const totalPrice = unitPrice * Number(quantity);

    /* ---------- Instructions Handling ---------- */
    let instructions = [];

    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];

        const upload = await uploadToCloudinary(
          file.buffer,
          `visiting/cart-designs/${selectedCard.userId}`
        );

        instructions.push({
          designFile: upload.secure_url,
          note: req.body?.instructions?.[i]?.note || ""
        });
      }
    }

    /* ---------- Check Existing Cart ---------- */
    let cartItem = await VisitingCart.findOne({
      userId: selectedCard.userId,
      userSelectedCardId: selectedCard._id,
      status: "active"
    });

    if (cartItem) {
      cartItem.quantity = quantity;
      cartItem.unitPrice = unitPrice;
      cartItem.totalPrice = totalPrice;

      // ✅ REPLACE instructions (NO DUPLICATES)
      if (instructions.length > 0) {
        cartItem.instructions = instructions;
      }

      await cartItem.save();
    } else {
      cartItem = await VisitingCart.create({
        userId: selectedCard.userId,
        userSelectedCardId: selectedCard._id,
        quantity,
        unitPrice,
        totalPrice,
        instructions
      });
    }

    /* ---------- Populate Clean Response ---------- */
    const populatedCart = await VisitingCart.findById(cartItem._id)
      .populate({
        path: "userSelectedCardId",
        select: "selectedOptions ProductId images userId createdAt",
        populate: {
          path: "ProductId",
          select: "productName category subCategory images"
        }
      });

    /* ---------- REMOVE userSelectedCard.selectedOptions.quantity ---------- */
    if (
      populatedCart?.userSelectedCardId?.selectedOptions?.quantity !== undefined
    ) {
      delete populatedCart.userSelectedCardId.selectedOptions.quantity;
    }

    return res.status(201).json({
      success: true,
      message: "Item added to cart successfully",
      data: populatedCart
    });

  } catch (error) {
    console.error("Add to cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add item to cart",
      error: error.message
    });
  }
};
// 2. GET CART BY USER
const getCartByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const cart = await VisitingCart.find({ userId, status: "active" })
      .populate({
        path: "userSelectedCardId",
        select: "selectedOptions ProductId images",
        populate: {
          path: "ProductId",
          select: "productName category subCategory images"
        }
      });

    cart.forEach(item => {
      delete item.userSelectedCardId?.selectedOptions?.quantity;
    });

    res.json({
      success: true,
      count: cart.length,
      data: cart
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// 3. UPDATE CART ITEM
const updateCartItem = async (req, res) => {
  try {
    const { cartId } = req.params;
    const { quantity } = req.body;

    const cartItem = await VisitingCart.findById(cartId);
    if (!cartItem) {
      return res.status(404).json({ success: false, message: "Cart item not found" });
    }

    if (quantity) {
      cartItem.quantity = quantity;
      cartItem.totalPrice = cartItem.unitPrice * quantity;
    }

    if (req.files?.length) {
      let instructions = [];

      for (let i = 0; i < req.files.length; i++) {
        const upload = await uploadToCloudinary(
          req.files[i].buffer,
          `visiting/cart-designs/${cartItem.userId}`
        );

        instructions.push({
          designFile: upload.secure_url,
          note: req.body?.instructions?.[i]?.note || ""
        });
      }

      cartItem.instructions = instructions;
    }

    await cartItem.save();

    res.json({ success: true, message: "Cart updated", data: cartItem });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// 4. REMOVE CART ITEM
const removeCartItem = async (req, res) => {
  try {
    const { cartId } = req.params;

    const cartItem = await VisitingCart.findById(cartId);
    if (!cartItem) {
      return res.status(404).json({ success: false, message: "Cart item not found" });
    }

    cartItem.status = "removed";
    await cartItem.save();

    res.json({ success: true, message: "Cart item removed" });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// 5. CLEAR USER CART
const clearCart = async (req, res) => {
  try {
    const { userId } = req.params;

    await VisitingCart.updateMany(
      { userId, status: "active" },
      { status: "removed" }
    );

    res.json({ success: true, message: "Cart cleared successfully" });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// 6. GET CART COUNT
/* ================= GET ALL CARTS ================= */
const getAllCarts = async (req, res) => {
  try {
    const carts = await VisitingCart.find({ status: "active" })
      .populate({
        path: "userSelectedCardId",
        select: "selectedOptions ProductId images userId createdAt",
        populate: {
          path: "ProductId",
          select: "productName category subCategory images"
        }
      })
      .sort({ updatedAt: -1 });

    // ❌ Remove selectedOptions.quantity from each cart
    carts.forEach(cart => {
      if (
        cart?.userSelectedCardId?.selectedOptions?.quantity !== undefined
      ) {
        delete cart.userSelectedCardId.selectedOptions.quantity;
      }
    });

    return res.status(200).json({
      success: true,
      count: carts.length,
      data: carts
    });

  } catch (error) {
    console.error("Get all carts error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch carts",
      error: error.message
    });
  }
};




const createOrderFromCart = async (req, res) => {
  try {
    const { cartId } = req.body;

    /* ---------- Validation ---------- */
    if (!cartId) {
      return res.status(400).json({
        success: false,
        message: "cartId is required"
      });
    }

    /* ---------- Fetch Active Cart ---------- */
    const cart = await VisitingCart.findOne({
      _id: cartId,
      status: "active"
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Active cart not found"
      });
    }

    /* ---------- Fetch Admin Charges ---------- */
    const adminCharge = await AdminCharge.findOne({ isActive: true });

    if (!adminCharge) {
      return res.status(500).json({
        success: false,
        message: "Admin charges not configured"
      });
    }

    /* ---------- Price Calculation ---------- */
    const subTotal = cart.totalPrice;
    const deliveryPrice = adminCharge.deliveryPrice;
    const taxPrice = adminCharge.taxPrice;

    const totalPrice =
      Number(subTotal) +
      Number(deliveryPrice) +
      Number(taxPrice);

    /* ---------- Create Order ---------- */
    const order = await VisitingOrder.create({
      userId: cart.userId,
      cartId: cart._id,
      adminChargeId: adminCharge._id,
      subTotal,
      deliveryPrice,
      taxPrice,
      totalPrice
    });

    /* ---------- Lock Cart ---------- */
    cart.status = "ordered";
    await cart.save();

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: {
        orderId: order._id,
        subTotal,
        deliveryPrice,
        taxPrice,
        totalPrice,
        status: order.status
      }
    });

  } catch (error) {
    console.error("Create order error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message
    });
  }
};




const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await VisitingOrder.findById(orderId)
      .populate("cartId")
      .populate("adminChargeId");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, data: order });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const getOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await VisitingOrder.find({ userId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const getAllOrders = async (req, res) => {
  try {
    const orders = await VisitingOrder.find()
      .populate("cartId")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const allowedStatus = [
      "pending",
      "confirmed",
      "processing",
      "completed",
      "cancelled"
    ];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const order = await VisitingOrder.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({
      success: true,
      message: "Order status updated",
      data: order
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await VisitingOrder.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Completed orders cannot be cancelled"
      });
    }

    order.status = "cancelled";
    await order.save();

    res.json({
      success: true,
      message: "Order cancelled successfully"
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await VisitingOrder.findByIdAndDelete(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({
      success: true,
      message: "Order deleted successfully"
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


/* =====================================================
   📤 EXPORTS
===================================================== */

module.exports = {
  createVisitingcards,
  getAllVisitingcards,
  getVisitingcardById,
  getByCategoryName,
  getBySubCategoryName,
  getByProductName,
  updateVisitingcard,
  deleteVisitingcard,
  createUserCard,
  getAllUserCards,
  getUserCardById,
  getUserCardsByUser,
  updateUserCard,
  deleteUserCard,
  addToCart,
  getCartByUser,
  updateCartItem,
  removeCartItem,
  clearCart,
  getAllCarts,
  createOrderFromCart,
  getOrderById,
  getOrdersByUser,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  deleteOrder
};
