const express = require('express');
const router = express.Router();
const {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress
} = require("../controllers/AddressController");

// GET all addresses
router.get('/:userId', getAddresses);

// POST new address
router.post('/:userId', addAddress);

// PUT update address
router.put('/:userId/:addressId', updateAddress);

// DELETE address
router.delete('/:userId/:addressId', deleteAddress);

module.exports = router;
