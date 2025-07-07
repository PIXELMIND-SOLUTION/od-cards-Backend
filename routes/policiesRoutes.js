// routes/policiesRoutes.js

const express = require("express");
const router = express.Router();
const {
  createPolicy,
  getAllPolicies,
  getPolicyById,
  updatePolicy,
  deletePolicy,
} = require("../controllers/policiesController");

router.post("/create-policy", createPolicy);            // Create
router.get("/allpolicies", getAllPolicies);           // Read all
router.get("/getpolicy/:id", getPolicyById);         // Read one
router.put("/updatepolicy/:id", updatePolicy);          // Update
router.delete("/deletepolicy/:id", deletePolicy);       // Delete

module.exports = router;
