const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
  teacherName: String,
  teacherEmail: { type: String, unique: true },
  teacherPassword: String,
  teacherGender: { type: String, enum: ["Male", "Female", "Other"] },
  teacherNumber: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  departments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Department" }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Teacher", teacherSchema);
