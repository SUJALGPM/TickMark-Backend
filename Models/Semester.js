// models/semesterModel.js

const mongoose = require("mongoose");

const semesterSchema = new mongoose.Schema({
  semesterNumber: {
    type: Number, 
    required: true
  },
  academicYear: {
    type: Number, 
    required: true
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true
  },
  startMonth: {
    type: Number, 
    required: true
  },
  endMonth: {
    type: Number, 
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Semester = mongoose.model("Semester", semesterSchema);
module.exports = Semester;
