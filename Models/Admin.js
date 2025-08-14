const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  adminId: String,
  adminName: String,
  adminPassword: String,
  adminGender: String,
  adminNumber: String,
  Teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Teacher" }],
  Departments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Department" }],
  Allocations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Allocation" }],
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

module.exports = mongoose.model("Admin", adminSchema);
