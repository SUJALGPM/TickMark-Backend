const mongoose = require("mongoose");

const allocationSchema = new mongoose.Schema({
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    required: true,
  },
  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  type: { type: String, enum: ["Theory", "Practical"], required: true },
  division: { type: String }, 
  batch: { type: String },
  totalPlanned: { type: Number, default: 0 },
  totalConducted: { type: Number, default: 0 },
  createdAt: {
    type: String,
    default: () => {
      const currentDate = new Date();
      const day = currentDate.getDate().toString().padStart(2, "0");
      const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
      const year = currentDate.getFullYear();
      return `${day}/${month}/${year}`;
    },
  },
});

module.exports = mongoose.model("Allocation", allocationSchema);
