const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  description: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  semesters: [{ type: mongoose.Schema.Types.ObjectId, ref: "Semester" }],
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

module.exports = mongoose.model("Department", departmentSchema);
