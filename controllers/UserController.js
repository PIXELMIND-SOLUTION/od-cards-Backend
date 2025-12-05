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
    const { userId, cartId } = req.body;

    console.log("📦 Creating Order for userId:", userId, "cartId:", cartId);

    // Validate required fields
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'userId is required' 
      });
    }

    if (!cartId) {
      return res.status(400).json({ 
        success: false, 
        message: 'cartId is required' 
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

    // Handle both single cartId and array of cartIds
    const cartIds = Array.isArray(cartId) ? cartId : [cartId];
    
    // Get cart items
    const cartItems = await Cart.find({ 
      _id: { $in: cartIds }, 
      userId 
    })
      .populate({
        path: 'visitingCardOrder',
        select: 'productName price images productCategory printingType laminationType'
      })
      .populate({
        path: 'userId',
        select: 'name email mobile location'
      });

    if (!cartItems || cartItems.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cart item(s) not found or do not belong to the user' 
      });
    }

    // Get user's default address or first address
    const address = await Address.findOne({ userId }).sort({ createdAt: -1 });
    
    if (!address) {
      return res.status(400).json({ 
        success: false, 
        message: 'No address found. Please add an address before placing an order.' 
      });
    }

    // Calculate totals and prepare order items
    let subtotal = 0;
    let totalDeliveryCharges = 0;
    const orderItems = [];

    for (let cartItem of cartItems) {
      if (!cartItem.visitingCardOrder) {
        console.error("❌ Missing visitingCardOrder for cart item:", cartItem._id);
        continue;
      }

      subtotal += cartItem.itemPrice || 0;
      totalDeliveryCharges += cartItem.deliveryPrice || 50;

      const orderItem = {
        cartId: cartItem._id,
        visitingCardOrder: cartItem.visitingCardOrder._id,
        orderDetails: {
          productCategory: cartItem.orderDetails?.productCategory || cartItem.visitingCardOrder.productCategory,
          productName: cartItem.orderDetails?.productName || cartItem.visitingCardOrder.productName,
          printingType: cartItem.orderDetails?.printingType || cartItem.visitingCardOrder.printingType,
          quantity: cartItem.quantity || 1,
          laminationType: cartItem.orderDetails?.laminationType || cartItem.visitingCardOrder.laminationType || [],
          boxPacking: cartItem.orderDetails?.boxPacking || false,
          roundCorners: cartItem.orderDetails?.roundCorners || false,
          bigSizeCard: cartItem.orderDetails?.bigSizeCard || false,
          padding: cartItem.orderDetails?.padding || false,
          creasing: cartItem.orderDetails?.creasing || false,
          scoring: cartItem.orderDetails?.scoring || false,
          shapeCutting: cartItem.orderDetails?.shapeCutting || false,
          dieCut: cartItem.orderDetails?.dieCut || false,
          cardSizeMultiplier: cartItem.orderDetails?.cardSizeMultiplier || 1,
          size: cartItem.orderDetails?.size || [],
          boardType: cartItem.orderDetails?.boardType || [],
          boardThickness: cartItem.orderDetails?.boardThickness || '',
          paperType: cartItem.orderDetails?.paperType || [],
          gsm: cartItem.orderDetails?.gsm || [],
          specialOptions: cartItem.orderDetails?.specialOptions || [],
          specialNotes: cartItem.orderDetails?.specialNotes || '',
          images: cartItem.orderDetails?.images || cartItem.visitingCardOrder.images || []
        },
        designFile: cartItem.designFile || '',
        itemPrice: cartItem.itemPrice || 0,
        deliveryPrice: cartItem.deliveryPrice || 50,
        quantity: cartItem.quantity || 1,
        totalPrice: cartItem.totalPrice || (cartItem.itemPrice + cartItem.deliveryPrice)
      };

      orderItems.push(orderItem);
    }

    if (orderItems.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No valid items to create order' 
      });
    }

    const totalAmount = subtotal + totalDeliveryCharges;

    console.log("💰 Order Summary:", {
      subtotal,
      totalDeliveryCharges,
      totalAmount,
      itemCount: orderItems.length
    });

    // 🔥 IMPROVED: Generate UNIQUE orderNumber with better retry mechanism
    const maxRetries = 10;
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Generate highly unique order number
        const timestamp = Date.now();
        const randomPart = crypto.randomBytes(6).toString('hex').toUpperCase();
        const orderNumber = `ORD-${timestamp}-${randomPart}`;

        console.log(`🔄 Attempt ${attempt}/${maxRetries}: Trying orderNumber:`, orderNumber);

        // Create new order
        const newOrder = new Order({
          userId,
          addressId: address._id,
          orderNumber,
          orderItems,
          subtotal,
          totalDeliveryCharges,
          totalAmount,
          paymentMethod: 'COD',
          orderStatus: 'Pending',
          paymentStatus: 'Pending'
        });

        await newOrder.save();
        console.log("✅ Order Created Successfully:", newOrder._id, "Order Number:", orderNumber);

        // Delete the cart items after successful order creation
        await Cart.deleteMany({ 
          _id: { $in: cartIds }, 
          userId 
        });
        console.log("🗑️ Cart item(s) cleared");

        // Populate order details for response
        const populatedOrder = await Order.findById(newOrder._id)
          .populate({
            path: 'userId',
            select: 'name email mobile location'
          })
          .populate({
            path: 'addressId',
            select: 'fullName mobile address city state pincode country'
          })
          .populate({
            path: 'orderItems.visitingCardOrder',
            select: 'productName price images productCategory printingType laminationType'
          });

        // Format response
        const formattedOrder = {
          _id: populatedOrder._id,
          orderNumber: populatedOrder.orderNumber,
          userId: {
            _id: populatedOrder.userId._id,
            name: populatedOrder.userId.name,
            email: populatedOrder.userId.email,
            mobile: populatedOrder.userId.mobile,
            location: populatedOrder.userId.location
          },
          addressId: {
            _id: populatedOrder.addressId._id,
            fullName: populatedOrder.addressId.fullName,
            mobile: populatedOrder.addressId.mobile,
            address: populatedOrder.addressId.address,
            city: populatedOrder.addressId.city,
            state: populatedOrder.addressId.state,
            pincode: populatedOrder.addressId.pincode,
            country: populatedOrder.addressId.country
          },
          orderItems: populatedOrder.orderItems.map(item => ({
            _id: item._id,
            cartId: item.cartId,
            visitingCardOrder: {
              _id: item.visitingCardOrder._id,
              productName: item.visitingCardOrder.productName,
              price: item.visitingCardOrder.price,
              images: item.visitingCardOrder.images,
              productCategory: item.visitingCardOrder.productCategory,
              printingType: item.visitingCardOrder.printingType,
              laminationType: item.visitingCardOrder.laminationType
            },
            orderDetails: item.orderDetails,
            designFile: item.designFile,
            itemPrice: item.itemPrice,
            deliveryPrice: item.deliveryPrice,
            quantity: item.quantity,
            totalPrice: item.totalPrice,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt
          })),
          subtotal: populatedOrder.subtotal,
          totalDeliveryCharges: populatedOrder.totalDeliveryCharges,
          totalAmount: populatedOrder.totalAmount,
          paymentMethod: populatedOrder.paymentMethod,
          orderStatus: populatedOrder.orderStatus,
          paymentStatus: populatedOrder.paymentStatus,
          createdAt: populatedOrder.createdAt,
          updatedAt: populatedOrder.updatedAt
        };

        // ✅ Success - return the response
        return res.status(201).json({
          success: true,
          message: 'Order created successfully',
          data: formattedOrder
        });

      } catch (error) {
        lastError = error;
        
        // Check if it's a duplicate key error
        if (error.code === 11000) {
          console.log(`⚠️ Duplicate orderNumber on attempt ${attempt}. Retrying...`);
          
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 50 * attempt));
          continue;
        } else {
          // For non-duplicate errors, throw immediately
          throw error;
        }
      }
    }

    // If we've exhausted all retries
    console.error("❌ Failed to create order after", maxRetries, "attempts");
    return res.status(500).json({
      success: false,
      message: 'Unable to generate unique order number after multiple attempts. Please try again.',
      error: lastError?.message || 'MAX_RETRIES_EXCEEDED'
    });

  } catch (error) {
    console.error('❌ Error creating order:', error);
    
    // Handle specific errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate entry detected. This should not happen. Please contact support.',
        details: error.keyPattern
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error' 
    });
  }
};

// ---------------- GET ALL ORDERS ----------------
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email mobile")
      .populate("addressId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("Fetching orders error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching orders",
    });
  }
};


// ---------------- GET ORDER BY ID ----------------
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("userId", "name email mobile")
      .populate("addressId");

    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error("Error order by id:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};


exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId })
      .populate("addressId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching my orders:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};



exports.getSingleOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate("userId", "name email mobile location")
      .populate("addressId")
      .populate({
        path: "cartItems.productId",
        model: "VisitingCardOrder",
        select: "productName price images printingType"
      });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Order fetched successfully",
      data: order,
    });

  } catch (error) {
    console.error("Get single order error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};


// ---------------- UPDATE ORDER BY ID ----------------
exports.updateOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Allowed fields to update
    const allowedUpdates = ["status", "addressId"];
    const updates = {};

    Object.keys(updateData).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        updates[key] = updateData[key];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields to update"
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    })
      .populate("userId", "name email mobile")
      .populate("addressId");

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
      data: updatedOrder,
    });

  } catch (error) {
    console.error("Update order error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};


// ---------------- DELETE ORDER BY ID ----------------
exports.deleteOrder = async (req, res) => {
  try {
    const deleted = await Order.findByIdAndDelete(req.params.id);

    if (!deleted)
      return res.status(404).json({ success: false, message: "Order not found" });

    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
      deleted,
    });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
