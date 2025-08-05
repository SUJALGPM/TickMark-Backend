// models/subjectModel.js

const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true
  },
  semesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Semester",
    required: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher", 
    default: null
  },
  theory: {
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
    hasTheory: { type: Boolean, default: false }
  },
  practical: {
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
    hasPractical: { type: Boolean, default: false }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Subject = mongoose.model("Subject", subjectSchema);
module.exports = Subject;
