const User = require('../models/User');
const Product = require("../models/Product");
const { uploadDesignFile } = require('../middleware/upload');
const Cart = require("../models/Cart")
const Order = require("../models/Order")
const Address = require("../models/Address")

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
    // 1. File upload handle karo, agar file na bhi aaye toh chalega
    await uploadDesignFileMiddleware(req, res);

    // 2. Body se required data lo
    const { userId, productId, quantity } = req.body;

    // 3. Validation
    if (!userId || !productId || !quantity) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // 4. Product check karo
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // 5. Design file path set karo agar file uploaded ho
    let designPath = '';
    if (req.file) {
      designPath = `/uploads/userDesigns/${req.file.filename}`;
    }

    // 6. Calculate price details
    const deliveryPrice = 50; // fixed delivery price
    const totalPrice = (product.price * quantity) + deliveryPrice;

    // 7. New cart item banao
    const newCartItem = new Cart({
      userId,
      productId,
      quantity,
      designFile: designPath,
      specialInstructions: notes,
      deliveryPrice: deliveryPrice,
      totalPrice: totalPrice
    });

    // 8. Save cart item
    await newCartItem.save();

    // 9. Response bhejo
    res.status(200).json({
      success: true,
      message: 'Product added to cart successfully',
      cartItem: {
        id: newCartItem._id,
        userId: newCartItem.userId,
        productId: newCartItem.productId,
        quantity: newCartItem.quantity,
        designFile: newCartItem.designFile,
        specialInstructions: newCartItem.specialInstructions,
        deliveryPrice: newCartItem.deliveryPrice,
        totalPrice: newCartItem.totalPrice
      }
    });

  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ success: false, message: error.message || 'Internal server error' });
  }
};


exports.getMyCart = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    // Find all cart items for the user and populate product details
    const cartItems = await Cart.find({ userId }).populate('productId');

    if (cartItems.length === 0) {
      return res.status(404).json({ success: false, message: 'No cart items found' });
    }

    const formattedCart = cartItems.map(item => {
      const product = item.productId;

      return {
        cartItemId: item._id,
        quantity: item.quantity,
        designFile: item.designFile,
        deliveryPrice: item.deliveryPrice,
        totalPrice: item.totalPrice,
        createdAt: item.createdAt,
        product: {
          productId: product._id,
          name: product.name,
          description: product.description,
          price: product.price,
          offeredPrice: product.offeredPrice,
          category: product.category,
          subCategory: product.subCategory,
          isInStock: product.isInStock,
          quantityAvailable: product.quantity,
          images: product.images, // assuming URLs or relative paths
          createdAt: product.createdAt
        }
      };
    });

    res.status(200).json({
      success: true,
      cart: formattedCart
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ success: false, message: error.message || 'Internal server error' });
  }
};



exports.createOrder = async (req, res) => {
  try {
    const { userId, addressId } = req.body;

    if (!userId || !addressId) {
      return res.status(400).json({ success: false, message: 'userId and addressId are required' });
    }

    const address = await Address.findById(addressId);
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    const cartItems = await Cart.find({ userId }).populate('productId');
    if (!cartItems.length) {
      return res.status(400).json({ success: false, message: 'No items in cart' });
    }

    let orderTotal = 0;
    const items = cartItems.map(item => {
      orderTotal += item.totalPrice;

      return {
        productId: item.productId._id,
        quantity: item.quantity,
        designFile: item.designFile,
        deliveryPrice: item.deliveryPrice,
        totalPrice: item.totalPrice
      };
    });

    // Calculate delivery date (e.g., +5 days)
    const deliveryDays = 5;
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + deliveryDays);

    const newOrder = new Order({
      userId,
      addressId,
      items,
      orderTotal,
      deliveredIn: '3-5 days',
      deliveryDate
    });

    await newOrder.save();

    // Optionally: Clear user's cart
    await Cart.deleteMany({ userId });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: {
        id: newOrder._id,
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


exports.getMyOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.query; // optional query param

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    // Build query dynamically
    const query = { userId };
    if (status) {
      query.status = status; // Add status filter if provided
    }

    const orders = await Order.find(query)
      .populate('addressId')
      .sort({ createdAt: -1 });

    if (!orders.length) {
      return res.status(404).json({ success: false, message: 'No orders found' });
    }

    const formattedOrders = [];

    for (const order of orders) {
      const formattedItems = [];

      for (const item of order.items) {
        const product = await Product.findById(item.productId);
        if (!product) continue;

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

      formattedOrders.push({
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
      });
    }

    res.status(200).json({
      success: true,
      orders: formattedOrders
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, message: error.message || 'Internal Server Error' });
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