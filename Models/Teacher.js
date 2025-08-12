const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
  teacherName: String,
  teacherEmail: { type: String, unique: true },
  teacherPassword: String,
  teacherGender: { type: String, enum: ["Male", "Female", "Other"] },
  teacherNumber: String,
  department: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
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

module.exports = mongoose.model("Teacher", teacherSchema);
