const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String
  },
  divisions: [String], 
  batches: [String],   
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Department = mongoose.model("Department", departmentSchema);
module.exports = Department;
