// models/Policy.js

const mongoose = require("mongoose");

const policySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      enum: ["Privacy Policy", "Terms & Conditions", "Refund Policy"], // Optional
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Policy", policySchema);
