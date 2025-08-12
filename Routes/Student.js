const express = require("express");
const router = express.Router();
const { studentRegister, studentLogin, uploadStudentExcelSheet } = require("../Controllers/Student");

// Register student...
router.post("/register", studentRegister);

// Login student...
router.post("/login", studentLogin);

// Upload student excel sheet...
router.post("/upload-student-sheet", uploadStudentExcelSheet);

module.exports = router;
