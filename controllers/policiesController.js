// controllers/policiesController.js

const Policy = require("../models/Policy");

// Create new policy
exports.createPolicy = async (req, res) => {
  try {
    const { title, content } = req.body;
    const policy = new Policy({ title, content });
    await policy.save();
    res.status(201).json(policy);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all policies
exports.getAllPolicies = async (req, res) => {
  try {
    const policies = await Policy.find();
    res.json(policies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single policy by ID
exports.getPolicyById = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id);
    if (!policy) return res.status(404).json({ message: "Policy not found" });
    res.json(policy);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update policy by ID
exports.updatePolicy = async (req, res) => {
  try {
    const { title, content } = req.body;
    const policy = await Policy.findByIdAndUpdate(
      req.params.id,
      { title, content },
      { new: true }
    );
    if (!policy) return res.status(404).json({ message: "Policy not found" });
    res.json(policy);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete policy by ID
exports.deletePolicy = async (req, res) => {
  try {
    const policy = await Policy.findByIdAndDelete(req.params.id);
    if (!policy) return res.status(404).json({ message: "Policy not found" });
    res.json({ message: "Policy deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
