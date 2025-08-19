const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
  status: {
    type: String,
    enum: ["Present", "Absent", "Late", "Excused"],
    required: true,
  },
  type: {
    type: String,
    enum: ["Theory", "Practical"],
    required: true,
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    required: true,
  },
  createdAtDate: {
    type: String,
    default: () => {
      const currentDate = new Date();
      const day = currentDate.getDate().toString().padStart(2, "0");
      const month = (currentDate.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-based, so we add 1
      const year = currentDate.getFullYear();
      return `${day}/${month}/${year}`;
    },
  },
  createdAtTime: {
    type: String,
    default: () => {
      const currentTime = new Date();
      const hours = currentTime.getHours().toString().padStart(2, "0");
      const minutes = currentTime.getMinutes().toString().padStart(2, "0");
      const seconds = currentTime.getSeconds().toString().padStart(2, "0");
      return `${hours}:${minutes}:${seconds}`;
    },
  },
});

// Unique index to prevent duplicate attendance
attendanceSchema.index(
  { studentId: 1, subjectId: 1, type: 1, createdAtDate: 1 },
  { unique: true }
);

const Attendance = mongoose.model("Attendance", attendanceSchema);
module.exports = Attendance;
