const mongoose = require("mongoose");

const semesterSchema = new mongoose.Schema({
  semesterNumber: Number,
  academicYear: Number,
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  startMonth: { type: String, required: true }, 
  endMonth: { type: String, required: true },   
  subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject" }],
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

module.exports = mongoose.model("Semester", semesterSchema);
