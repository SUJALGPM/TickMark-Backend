const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: String,
  studentId: { type: String, unique: true },
  email: { type: String, unique: true },
  password: String,
  division: String,
  batch: String,
  contactNumber: String,
  gender: { type: String, enum: ["Male", "Female", "Other"], default: "Other" },
  attedanceRecord :[{ type: mongoose.Schema.Types.ObjectId, ref: "Attendance" }],
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  semesterId: { type: mongoose.Schema.Types.ObjectId, ref: "Semester" },
  subjects: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
  createdAt: {
    type: String,
    default: () => {
      const currentDate = new Date();
      const day = currentDate.getDate().toString().padStart(2, "0");
      const month = (currentDate.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-based, so we add 1
      const year = currentDate.getFullYear();
      return `${day}/${month}/${year}`;
    },
  },
});

module.exports = mongoose.model("Student", studentSchema);
