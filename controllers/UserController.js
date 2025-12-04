const User = require('../models/User');
const Product = require("../models/Product");
const { uploadDesignFile } = require('../middleware/upload');
const Cart = require("../models/Cart")
const Order = require("../models/Order")
const Address = require("../models/Address")
const VisitingCardOrder = require("../models/VisitingCardOrder"); // ✅ add this

// ✅ Add this helper function
const parseBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lowerValue = value.toLowerCase().trim();
    return lowerValue === 'true' || lowerValue === 'yes' || lowerValue === '1';
  }
  if (typeof value === 'number') return value === 1;
  return false;
};

// ✅ Register or Login User by Mobile
exports.registerUser = async (req, res) => {
  try {
    const { name, email, mobile, location } = req.body;

    if (!name || !email || !mobile || !location) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ mobile });
    if (existingUser) {
      return res.status(200).json({
        message: 'User already exists, logging in',
        user: existingUser
      });
    }

    const newUser = new User({ name, email, mobile, location });
    await newUser.save();

    res.status(201).json({
      message: 'User registered successfully',
      user: newUser
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// ✅ Get All Users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();

    res.status(200).json({
      message: 'All users fetched successfully',
      users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
};

// ✅ Get User by ID
exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'User fetched successfully',
      user
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Server error fetching user' });
  }
};

// ✅ Update User by ID
exports.updateUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, mobile, location } = req.body;

    if (!name || !email || !mobile || !location) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email, mobile, location },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'User updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error updating user' });
  }
};

// ✅ Delete User by ID
exports.deleteUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'User deleted successfully',
      user: deletedUser
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error deleting user' });
  }
};


// multer middleware ko promise wrapper mein convert karna
const uploadDesignFileMiddleware = (req, res) => {
  return new Promise((resolve, reject) => {
    uploadDesignFile(req, res, function (err) {
      if (err) reject(err);
      else resolve();
    });
  });
};

// ✅ CREATE: Add to Cart (FIXED PRICE CALCULATION)
exports.addToCart = async (req, res) => {
  try {
    await uploadDesignFileMiddleware(req, res);

    const { 
      userId, 
      visitingCardId, 
      quantity = 1,
      boxPacking,
      roundCorners,
      bigSizeCard,
      cardSizeMultiplier,
    } = req.body;

    console.log("🛒 Adding to Cart:", {
      userId,
      visitingCardId,
      quantity
    });

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'userId is required' 
      });
    }

    if (!visitingCardId) {
      return res.status(400).json({ 
        success: false, 
        message: 'visitingCardId is required' 
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Get the visiting card order
    const visitingCard = await VisitingCardOrder.findById(visitingCardId);
    if (!visitingCard) {
      return res.status(404).json({ 
        success: false, 
        message: 'Visiting card order not found' 
      });
    }

    // Handle design file upload
    let designPath = '';
    if (req.file) {
      designPath = `/uploads/userDesigns/${req.file.filename}`;
    }

    // Calculate price based on quantity
    const itemPrice = visitingCard.price * quantity;
    const deliveryPrice = visitingCard.deliveryPrice || 50;
    const totalPrice = itemPrice + deliveryPrice;

    // Create cart item
    const newCartItem = new Cart({
      userId,
      visitingCardOrder: visitingCardId,
      orderDetails: {
        productCategory: visitingCard.productCategory,
        productName: visitingCard.productName,
        printingType: visitingCard.printingType,
        quantity: visitingCard.quantity,
        price: visitingCard.price,
        images: visitingCard.images || []
      },
      designFile: designPath || visitingCard.designFile || '',
      itemPrice,
      deliveryPrice,
      totalPrice,
      quantity: parseInt(quantity) || 1
    });

    await newCartItem.save();

    // Get user details
    const userDetails = await User.findById(userId).select('name email mobile location');

    // Prepare response with only required fields
    const responseData = {
      _id: newCartItem._id,
      userId: {
        _id: userDetails?._id,
        name: userDetails?.name,
        email: userDetails?.email,
        mobile: userDetails?.mobile,
        location: userDetails?.location
      },
      productId: visitingCard._id,
      productName: visitingCard.productName,
      productPrice: visitingCard.price,
      quantity: newCartItem.quantity,
      itemPrice: newCartItem.itemPrice,
      deliveryPrice: newCartItem.deliveryPrice,
      totalPrice: newCartItem.totalPrice,
      designFile: newCartItem.designFile,
      createdAt: newCartItem.createdAt
    };

    res.status(200).json({
      success: true,
      message: 'Visiting card added to cart successfully',
      data: responseData
    });

  } catch (error) {
    console.error('❌ Error adding to cart:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error'
    });
  }
};

// ---------------- GET ALL CART ITEMS (Modified) ----------------
exports.getAllCartItems = async (req, res) => {
  try {
    const carts = await Cart.find()
      .populate({
        path: 'userId',
        select: 'name email mobile location'
      })
      .populate({
        path: 'visitingCardOrder',
        select: 'productName price images'
      })
      .sort({ createdAt: -1 });

    // Format response with only required fields
    const formattedCarts = carts.map(cart => ({
      _id: cart._id,
      userId: cart.userId ? {
        _id: cart.userId._id,
        name: cart.userId.name,
        email: cart.userId.email,
        mobile: cart.userId.mobile,
        location: cart.userId.location
      } : null,
      productId: cart.visitingCardOrder?._id,
      productName: cart.visitingCardOrder?.productName,
      productPrice: cart.visitingCardOrder?.price,
      quantity: cart.quantity,
      itemPrice: cart.itemPrice,
      deliveryPrice: cart.deliveryPrice,
      totalPrice: cart.totalPrice,
      designFile: cart.designFile || '',
      images: cart.orderDetails?.images || [],
      createdAt: cart.createdAt
    }));

    res.status(200).json({
      success: true,
      message: 'All cart items fetched successfully',
      count: formattedCarts.length,
      data: formattedCarts
    });
  } catch (error) {
    console.error('Error fetching all cart items:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error' 
    });
  }
};

// ---------------- GET ALL CART ITEMS (Modified) ----------------
exports.getAllCartItems = async (req, res) => {
  try {
    const carts = await Cart.find()
      .populate({
        path: 'userId',
        select: 'name email mobile location'
      })
      .populate({
        path: 'visitingCardOrder',
        select: 'productName price images'
      })
      .sort({ createdAt: -1 });

    // Format response with only required fields
    const formattedCarts = carts.map(cart => ({
      _id: cart._id,
      userId: cart.userId ? {
        _id: cart.userId._id,
        name: cart.userId.name,
        email: cart.userId.email,
        mobile: cart.userId.mobile,
        location: cart.userId.location
      } : null,
      productId: cart.visitingCardOrder?._id,
      productName: cart.visitingCardOrder?.productName,
      productPrice: cart.visitingCardOrder?.price,
      quantity: cart.quantity,
      itemPrice: cart.itemPrice,
      deliveryPrice: cart.deliveryPrice,
      totalPrice: cart.totalPrice,
      designFile: cart.designFile || '',
      images: cart.orderDetails?.images || [],
      createdAt: cart.createdAt
    }));

    res.status(200).json({
      success: true,
      message: 'All cart items fetched successfully',
      count: formattedCarts.length,
      data: formattedCarts
    });
  } catch (error) {
    console.error('Error fetching all cart items:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error' 
    });
  }
};

// ---------------- GET CART ITEM BY ID (Modified) ----------------
exports.getCartById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const cart = await Cart.findById(id)
      .populate({
        path: 'userId',
        select: 'name email mobile location'
      })
      .populate({
        path: 'visitingCardOrder',
        select: 'productName price images productCategory printingType'
      });

    if (!cart) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cart item not found' 
      });
    }

    // Format response with only required fields
    const formattedCart = {
      _id: cart._id,
      userId: cart.userId ? {
        _id: cart.userId._id,
        name: cart.userId.name,
        email: cart.userId.email,
        mobile: cart.userId.mobile,
        location: cart.userId.location
      } : null,
      productId: cart.visitingCardOrder?._id,
      productName: cart.visitingCardOrder?.productName,
      productPrice: cart.visitingCardOrder?.price,
      productCategory: cart.visitingCardOrder?.productCategory,
      printingType: cart.visitingCardOrder?.printingType,
      quantity: cart.quantity,
      itemPrice: cart.itemPrice,
      deliveryPrice: cart.deliveryPrice,
      totalPrice: cart.totalPrice,
      designFile: cart.designFile || '',
      images: cart.orderDetails?.images || [],
      createdAt: cart.createdAt,
      orderDetails: {
        productCategory: cart.orderDetails?.productCategory,
        printingType: cart.orderDetails?.printingType,
        quantity: cart.orderDetails?.quantity
      }
    };

    res.status(200).json({ 
      success: true, 
      message: 'Cart item fetched successfully',
      data: formattedCart 
    });
  } catch (error) {
    console.error('Error fetching cart item by id:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error' 
    });
  }
};

// ---------------- GET MY CART (Modified) ----------------
exports.getMyCart = async (req, res) => {
  try {
    const { userId } = req.params;

    const carts = await Cart.find({ userId })
      .populate({
        path: 'userId',
        select: 'name email mobile location'
      })
      .populate({
        path: 'visitingCardOrder',
        select: 'productName price images productCategory printingType laminationType'
      })
      .sort({ createdAt: -1 });

    if (!carts.length) {
      return res.status(200).json({ 
        success: true, 
        message: 'Cart is empty', 
        data: [] 
      });
    }

    // Format each cart item
    const formattedCarts = carts.map(cart => ({
      _id: cart._id,
      userId: cart.userId ? {
        _id: cart.userId._id,
        name: cart.userId.name,
        email: cart.userId.email,
        mobile: cart.userId.mobile,
        location: cart.userId.location
      } : null,
      productId: cart.visitingCardOrder?._id,
      productName: cart.visitingCardOrder?.productName,
      productPrice: cart.visitingCardOrder?.price,
      productCategory: cart.visitingCardOrder?.productCategory,
      quantity: cart.quantity,
      itemPrice: cart.itemPrice,
      deliveryPrice: cart.deliveryPrice,
      totalPrice: cart.totalPrice,
      designFile: cart.designFile || '',
      images: cart.orderDetails?.images || cart.visitingCardOrder?.images || [],
      createdAt: cart.createdAt,
      orderDetails: {
        productCategory: cart.orderDetails?.productCategory,
        printingType: cart.orderDetails?.printingType,
        laminationType: cart.orderDetails?.laminationType,
        quantity: cart.orderDetails?.quantity
      }
    }));

    res.status(200).json({ 
      success: true, 
      message: 'Cart items fetched successfully',
      count: formattedCarts.length,
      data: formattedCarts 
    });
  } catch (error) {
    console.error('Error fetching cart items by userId:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error' 
    });
  }
};

// ---------------- UPDATE CART ITEM BY ID (Modified) ----------------
exports.updateCartById = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ 
        success: false, 
        message: 'Valid quantity is required (minimum 1)' 
      });
    }

    const cart = await Cart.findById(id)
      .populate('visitingCardOrder')
      .populate({
        path: 'userId',
        select: 'name email mobile location'
      });

    if (!cart) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cart item not found' 
      });
    }

    // Calculate new prices based on updated quantity
    const newItemPrice = cart.visitingCardOrder?.price * quantity;
    const newTotalPrice = newItemPrice + cart.deliveryPrice;

    // Update cart
    cart.quantity = quantity;
    cart.itemPrice = newItemPrice;
    cart.totalPrice = newTotalPrice;

    await cart.save();

    // Prepare response
    const responseData = {
      _id: cart._id,
      userId: cart.userId ? {
        _id: cart.userId._id,
        name: cart.userId.name,
        email: cart.userId.email,
        mobile: cart.userId.mobile,
        location: cart.userId.location
      } : null,
      productId: cart.visitingCardOrder?._id,
      productName: cart.visitingCardOrder?.productName,
      productPrice: cart.visitingCardOrder?.price,
      quantity: cart.quantity,
      itemPrice: cart.itemPrice,
      deliveryPrice: cart.deliveryPrice,
      totalPrice: cart.totalPrice,
      designFile: cart.designFile || '',
      updatedAt: new Date()
    };

    res.status(200).json({ 
      success: true, 
      message: 'Cart item updated successfully',
      data: responseData 
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error' 
    });
  }
};

// ---------------- DELETE CART ITEM BY ID (Modified) ----------------
exports.deleteCartById = async (req, res) => {
  try {
    const { id } = req.params;

    const cart = await Cart.findByIdAndDelete(id)
      .populate('visitingCardOrder')
      .populate({
        path: 'userId',
        select: 'name email mobile location'
      });

    if (!cart) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cart item not found' 
      });
    }

    // Prepare response data
    const deletedData = {
      _id: cart._id,
      userId: cart.userId ? {
        _id: cart.userId._id,
        name: cart.userId.name,
        email: cart.userId.email,
        mobile: cart.userId.mobile,
        location: cart.userId.location
      } : null,
      productId: cart.visitingCardOrder?._id,
      productName: cart.visitingCardOrder?.productName,
      productPrice: cart.visitingCardOrder?.price,
      quantity: cart.quantity,
      itemPrice: cart.itemPrice,
      deliveryPrice: cart.deliveryPrice,
      totalPrice: cart.totalPrice,
      deletedAt: new Date()
    };

    res.status(200).json({ 
      success: true, 
      message: 'Cart item deleted successfully',
      data: deletedData 
    });
  } catch (error) {
    console.error('Error deleting cart item:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error' 
    });
  }
};



exports.createOrder = async (req, res) => {
  try {
    const mongoose = require("mongoose");
    const body = req.body || {};

    // ✅ Convert userId to ObjectId because Cart schema uses ObjectId
    const userId = new mongoose.Types.ObjectId(body.userId || body["userId"]);
    const addressId = body.addressId || body["addressId"];

    if (!userId || !addressId) {
      return res.status(400).json({ success: false, message: "userId and addressId are required" });
    }

    const address = await Address.findById(addressId);
    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    // ✅ FIXED — use ObjectId userId to fetch cart
    const cartItems = await Cart.find({ userId })
      .populate("visitingCardId", "productName price");

    if (!cartItems.length) {
      return res.status(400).json({ success: false, message: "No items in cart" });
    }

    let orderTotal = 0;

    const items = cartItems.map(item => {
      const price = item.visitingCardId?.price || 0;
      const totalPrice = price * item.quantity + item.deliveryPrice;
      orderTotal += totalPrice;

      return {
        visitingCardId: item.visitingCardId._id,
        quantity: item.quantity,
        designFile: item.designFile,
        deliveryPrice: item.deliveryPrice,
        totalPrice
      };
    });

    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 5);

    const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newOrder = new Order({
      userId,
      addressId,
      items,
      orderTotal,
      deliveredIn: "3-5 days",
      deliveryDate,
      orderId,
    });

    await newOrder.save();

    // delete cart items
    await Cart.deleteMany({ userId });

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: newOrder
    });

  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};



// ---------------- GET ALL ORDERS ----------------
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("addressId").sort({ createdAt: -1 });
    if (!orders.length) return res.status(404).json({ success: false, message: "No orders found" });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching all orders:", error);
    res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
  }
};

// ---------------- GET ORDER BY ID ----------------
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate("addressId");
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Error fetching order by ID:", error);
    res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
  }
};

exports.getMyOrders = async (req, res) => {
     try {
    const { userId } = req.params;
    const { status } = req.query; // 👈 get status from query

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    const query = { userId };
    if (status) query.status = status; // filter by status if provided

    const orders = await Order.find(query)
      .populate('addressId')
      .sort({ createdAt: -1 });

    if (!orders.length) {
      return res.status(404).json({ success: false, message: 'No orders found' });
    }

    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.getSingleOrder = async (req, res) => {
  try {
    const { userId, orderId } = req.params;

    if (!userId || !orderId) {
      return res.status(400).json({ success: false, message: 'userId and orderId are required' });
    }

    const order = await Order.findOne({ _id: orderId, userId }).populate('addressId');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found for this user' });
    }

    const formattedItems = [];

    for (const item of order.items) {
      const product = await Product.findById(item.productId);
      formattedItems.push({
        product: {
          id: product._id,
          name: product.name,
          description: product.description,
          price: product.price,
          offeredPrice: product.offeredPrice,
          category: product.category,
          subCategory: product.subCategory,
          isInStock: product.isInStock,
          quantityAvailable: product.quantity,
          images: product.images,
          createdAt: product.createdAt
        },
        quantity: item.quantity,
        designFile: item.designFile,
        deliveryPrice: item.deliveryPrice,
        totalPrice: item.totalPrice
      });
    }

    const formattedOrder = {
      orderId: order._id,
      orderTotal: order.orderTotal,
      status: order.status,
      deliveredIn: order.deliveredIn,
      deliveryDate: order.deliveryDate,
      createdAt: order.createdAt,
      address: {
        name: order.addressId.name,
        email: order.addressId.email,
        mobileNumber: order.addressId.mobileNumber,
        addressline1: order.addressId.addressline1,
        addressline2: order.addressId.addressline2,
        city: order.addressId.city,
        state: order.addressId.state,
        pincode: order.addressId.pincode,
        country: order.addressId.country,
        type: order.addressId.type
      },
      items: formattedItems
    };

    res.status(200).json({
      success: true,
      order: formattedOrder
    });

  } catch (error) {
    console.error('Error fetching single order:', error);
    res.status(500).json({ success: false, message: error.message || 'Internal Server Error' });
  }
};

// ---------------- UPDATE ORDER BY ID ----------------
exports.updateOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const updates = req.body; // e.g., { status: "Shipped" }

    const order = await Order.findByIdAndUpdate(orderId, updates, { new: true });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    res.status(200).json({ success: true, message: "Order updated", order });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
  }
};

// ---------------- DELETE ORDER BY ID ----------------
exports.deleteOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findByIdAndDelete(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    res.status(200).json({ success: true, message: "Order deleted", order });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
  }
};