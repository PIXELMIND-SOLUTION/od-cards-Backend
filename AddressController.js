const Address = require('../models/Address');
const User = require('../models/User')

// 🔹 Get all addresses for a user
exports.getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ userId: req.params.userId });
    res.status(200).json(addresses);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching addresses' });
  }
};



// 🔹 Add a new address and link to user
exports.addAddress = async (req, res) => {
  try {
    const { userId } = req.params;

    // 1. Create new Address with userId
    const newAddress = new Address({ ...req.body, userId });

    // 2. Save the address
    const savedAddress = await newAddress.save();

    // 3. Push the address ID to the user's addresses array
    await User.findByIdAndUpdate(userId, {
      $push: { addresses: savedAddress._id }
    });

    // 4. Return the saved address
    res.status(201).json(savedAddress);

  } catch (err) {
    console.error('❌ Error adding address:', err);
    res.status(500).json({ message: 'Error adding address' });
  }
};


// 🔹 Update an address
exports.updateAddress = async (req, res) => {
  try {
    const updatedAddress = await Address.findByIdAndUpdate(
      req.params.addressId,
      req.body,
      { new: true }
    );
    res.status(200).json(updatedAddress);
  } catch (err) {
    res.status(500).json({ message: 'Error updating address' });
  }
};

// 🔹 Delete an address
exports.deleteAddress = async (req, res) => {
  try {
    await Address.findByIdAndDelete(req.params.addressId);
    res.status(200).json({ message: 'Address deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting address' });
  }
};
