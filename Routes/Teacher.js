const express = require("express");
const { uploadTeacherDataExcel, teacherRegister, teacherLogin } = require("../Controllers/Teacher");
const router = express.Router();
const upload = require("../Middlewares/UploadExcelFile");

// Register Routes...
router.post("/register", teacherRegister);

// Login Route....
router.post("/login", teacherLogin);

// Upload all teacher data through excel sheet...
router.post("/upload-teacher-sheet", upload.single("file"), uploadTeacherDataExcel);


module.exports = router;
