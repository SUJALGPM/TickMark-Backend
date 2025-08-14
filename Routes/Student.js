const express = require("express");
const router = express.Router();
const { studentRegister, studentLogin, uploadStudentExcelSheet, clearAllAllocationStudents } = require("../Controllers/Student");
const upload = require("../Middlewares/UploadExcelFile");

// Register student...
router.post("/register", studentRegister);

// Login student...
router.post("/login", studentLogin);

// Upload student excel sheet...
router.post("/upload-student-sheet", upload.single("file"), uploadStudentExcelSheet);

// Clear student allocation from schema....
router.post("/clear-students", clearAllAllocationStudents);


module.exports = router;
