const User = require('../models/User');
const Product = require("../models/Product");
const { uploadDesignFile } = require('../middleware/upload');
const Cart = require("../models/Cart")
const Order = require("../models/Order")
const Address = require("../models/Address")
const VisitingCardOrder = require("../models/VisitingCardOrder"); // ✅ add this

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

exports.addToCart = async (req, res) => {
  try {
    await uploadDesignFileMiddleware(req, res);

    const { userId, visitingCardId, quantity } = req.body;

    if (!userId || !visitingCardId || !quantity) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const visitingCard = await VisitingCardOrder.findById(visitingCardId);
    if (!visitingCard) {
      return res.status(404).json({ success: false, message: 'Visiting card not found' });
    }

    let designPath = '';
    if (req.file) {
      designPath = `/uploads/userDesigns/${req.file.filename}`;
    }

    const deliveryPrice = 50; // fixed delivery price
    const totalPrice = (visitingCard.price || 0) * quantity + deliveryPrice;

    const newCartItem = new Cart({
      userId,
      visitingCardId,
      quantity,
      designFile: designPath,
      deliveryPrice,
      totalPrice
    });

    await newCartItem.save();

    res.status(200).json({
      success: true,
      message: 'Visiting card added to cart successfully',
      cartItem: newCartItem
    });

  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

// ---------------- GET ALL CART ITEMS ----------------
exports.getAllCartItems = async (req, res) => {
 try {
    const carts = await Cart.find()
      .populate('userId', 'name email mobile location') // get user details

    res.status(200).json({
      success: true,
      carts
    });
  } catch (error) {
    console.error('Error fetching all cart items:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------- GET CART ITEM BY ID ----------------
exports.getCartById = async (req, res) => {
  try {
    const { id } = req.params;
    const cart = await Cart.findById(id).populate('userId','name email mobile location');

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart item not found' });
    }

    res.status(200).json({ success: true, cart });
  } catch (error) {
    console.error('Error fetching cart item by id:', error);
    res.status(500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

exports.getMyCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const carts = await Cart.find({ userId }).populate('userId','name email mobile location');
    //populate('visitingCardId');
    if (!carts.length) {
      return res.status(404).json({ success: false, message: 'No cart items found for this user' });
    }

    res.status(200).json({ success: true, carts });
  } catch (error) {
    console.error('Error fetching cart items by userId:', error);
    res.status(500).json({ success: false, message: error.message || 'Internal server error' });
  }
};
// ---------------- UPDATE CART ITEM BY ID ----------------
exports.updateCartById = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findById(id).populate('visitingCardId');
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart item not found' });
    }

    if (quantity) {
      cart.quantity = quantity;
      cart.totalPrice = (cart.visitingCardId.price || 0) * quantity + cart.deliveryPrice;
    }

    await cart.save();

    res.status(200).json({ success: true, message: 'Cart item updated', cart });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

// ---------------- DELETE CART ITEM BY ID ----------------
exports.deleteCartById = async (req, res) => {
  try {
    const { id } = req.params;

    const cart = await Cart.findByIdAndDelete(id);
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart item not found' });
    }

    res.status(200).json({ success: true, message: 'Cart item deleted', cart });
  } catch (error) {
    console.error('Error deleting cart item:', error);
    res.status(500).json({ success: false, message: error.message || 'Internal server error' });
  }
};




exports.createOrder = async (req, res) => {
 try {
    // Support both JSON and multipart/form-data
    const userId = req.body.userId || req.body['userId'];
    const addressId = req.body.addressId || req.body['addressId'];

    if (!userId || !addressId) {
      return res.status(400).json({ success: false, message: 'userId and addressId are required' });
    }

    // Find address
    const address = await Address.findById(addressId);
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    // Fetch cart items
    const cartItems = await Cart.find({ userId }).populate('visitingCardId'); 
    if (!cartItems.length) {
      return res.status(400).json({ success: false, message: 'No items in cart' });
    }

    let orderTotal = 0;
    const items = cartItems.map(item => {
      const price = item.visitingCardId?.price || 0; // price from visiting card
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

    // Calculate delivery date (e.g., +5 days)
    const deliveryDays = 5;
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + deliveryDays);

    // Generate unique orderId
    const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newOrder = new Order({
      userId,
      addressId,
      items,
      orderTotal,
      deliveredIn: '3-5 days',
      deliveryDate,
      orderId // ✅ set unique orderId here
    });

    await newOrder.save();

    // Clear user's cart
    await Cart.deleteMany({ userId });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: {
        id: newOrder._id,
        orderId: newOrder.orderId,
        userId: newOrder.userId,
        orderTotal: newOrder.orderTotal,
        status: newOrder.status,
        deliveredIn: newOrder.deliveredIn,
        deliveryDate: newOrder.deliveryDate,
        createdAt: newOrder.createdAt,
        items,
        address: {
          name: address.name,
          email: address.email,
          mobileNumber: address.mobileNumber,
          addressline1: address.addressline1,
          addressline2: address.addressline2,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          country: address.country,
          type: address.type
        }
      }
    });

  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ success: false, message: error.message || 'Internal Server Error' });
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