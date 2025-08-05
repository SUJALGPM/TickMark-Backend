const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true
  },
  semesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Semester",
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ["Present", "Absent", "Late", "Excused"],
    required: true
  },
  type: {
    type: String,
    enum: ["Theory", "Practical"],
    required: true
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Attendance = mongoose.model("Attendance", attendanceSchema);
module.exports = Attendance;
