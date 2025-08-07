const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: String,
  studentId: { type: String, unique: true },
  email: String,
  division: String,
  batch: String,
  contactNumber: String,
  gender: { type: String, enum: ["Male", "Female", "Other"], default: "Other" },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  semesterId: { type: mongoose.Schema.Types.ObjectId, ref: "Semester" },
  subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject" }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Student", studentSchema);
