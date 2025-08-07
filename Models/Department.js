const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  description: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
  semesters: [{ type: mongoose.Schema.Types.ObjectId, ref: "Semester" }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Department", departmentSchema);
