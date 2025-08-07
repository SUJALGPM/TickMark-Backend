const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  adminId: String,
  adminName: String,
  adminPassword: String,
  adminGender: String,
  adminNumber: String,
  Teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Teacher" }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Admin", adminSchema);
