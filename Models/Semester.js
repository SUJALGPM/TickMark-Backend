const mongoose = require("mongoose");

const semesterSchema = new mongoose.Schema({
  semesterNumber: Number,
  academicYear: Number,
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  startMonth: { type: String, required: true }, 
  endMonth: { type: String, required: true },   
  subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject" }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Semester", semesterSchema);
