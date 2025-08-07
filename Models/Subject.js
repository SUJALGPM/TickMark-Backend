const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
  name: String,
  code: { type: String, unique: true },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },
  semesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Semester",
  },
  theory: {
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
  },
  practical: {
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Subject", subjectSchema);
