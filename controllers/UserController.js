const User = require('../models/User');
const Address = require("../models/Address");

// In your backend route handler
//POST User By mobile

exports.registerUser = async (req, res) => {
  try {
    const { name, email, mobile, location } = req.body;

    // Validate input
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

    console.log('Newly registered user:', newUser); // ✅

    res.status(201).json({
      message: 'User registered successfully',
      user: newUser
    });


  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

//GET User by Id

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

// PUT User by ID
exports.updateUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, mobile, location } = req.body;

    // Optional: validate fields if needed
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

