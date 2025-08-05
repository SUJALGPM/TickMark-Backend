const mongoose = require("mongoose");

// Configure teacher schema
const teacherSchema = new mongoose.Schema({
  teacherId: {
    type: String,
    required: false
  },
  teacherName: {
    type: String,
    required: true
  },
  teacherEmail: {
    type: String,
    required: true,
    unique: true
  },
  teacherPassword: {
    type: String,
    required: true
  },
  teacherGender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: false
  },
  teacherNumber: {
    type: String,
    required: false
  },
  department: {
    type: String,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'             
  },
  DateOfCreation: {
    type: String,
    default: () => {
      const currentDate = new Date();
      const day = currentDate.getDate().toString().padStart(2, '0');
      const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
      const year = currentDate.getFullYear();
      return `${day}/${month}/${year}`;
    }
  }
});

// Create teacher model
const teacherModel = mongoose.model("Teacher", teacherSchema);

module.exports = teacherModel;
