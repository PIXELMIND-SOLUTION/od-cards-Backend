const ContactInfo = require('../models/ContactInfo');

// Create Contact Info
exports.createContactInfo = async (req, res) => {
  try {
    const { phone, email, address } = req.body;

    const contact = new ContactInfo({ phone, email, address });
    await contact.save();

    res.status(201).json({ success: true, message: "Contact info created", data: contact });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};

// Get All Contact Info
exports.getContactInfo = async (req, res) => {
  try {
    const data = await ContactInfo.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};

// Update Contact Info
exports.updateContactInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const { phone, email, address } = req.body;

    const updated = await ContactInfo.findByIdAndUpdate(id, { phone, email, address }, { new: true });

    res.status(200).json({ success: true, message: "Contact info updated", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};

// Delete Contact Info
exports.deleteContactInfo = async (req, res) => {
  try {
    const { id } = req.params;
    await ContactInfo.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};
