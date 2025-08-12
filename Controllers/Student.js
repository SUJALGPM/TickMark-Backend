const Student = require("../models/Student");
const bcrypt = require("bcryptjs");
const Department = require("../Models/Department");
const Semester = require("../Models/Semester");

// REGISTER STUDENT
const studentRegister = async (req, res) => {
  try {
    const {
      name,
      studentId,
      email,
      password,
      division,
      batch,
      contactNumber,
      gender,
      departmentId,
      semesterId,
      subjects,
    } = req.body;

    // Check if student already exists using studentId only
    const studentExists = await Student.findOne({ studentId });
    if (studentExists) {
      return res
        .status(400)
        .json({ success: false, message: "Student ID already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create student
    const newStudent = await Student.create({
      name,
      studentId,
      email,
      password: hashedPassword,
      division,
      batch,
      contactNumber,
      gender,
      departmentId,
      semesterId,
      subjects,
    });

    res.status(201).json({
      success: true,
      message: "Student registered successfully",
      student: newStudent,
    });
  } catch (error) {
    console.error("Error in registerStudent:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// LOGIN STUDENT
const studentLogin = async (req, res) => {
  try {
    const { studentId, password } = req.body;

    // Check student by studentId
    const student = await Student.findOne({ studentId });
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid password" });
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      student,
    });
  } catch (error) {
    console.error("Error in loginStudent:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Utility to generate email for upload sheet...
function generateEmail(fullName, type) {
  const parts = fullName.trim().split(" ");
  const firstName = parts[0];
  const lastName = parts.slice(1).join("").replace(/\s+/g, "");
  const year = type.toUpperCase() === "R" ? "23" : "24";
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${year}@spit.ac.in`;
}

// Upload student Excel sheet...
const uploadStudentExcelSheet = async (req, res) => {
  try {
    const {departmentId,semesterId,adminId} = req.body;

    // Check admin exist or not..!
    const adminExist = await adminModel.findById(adminId);
    if (!adminExist) {
      return res
        .status(404)
        .json({ message: "Admin not found", success: false });
    }

    // Check if department exists
    const departmentExists = await Department.findById(departmentId);
    if (!departmentExists) {
      return res
        .status(404)
        .json({ success: false, message: "Department not found" });
    }

    // Check if semester exists
    const semesterExists = await Semester.findById(semesterId);
    if (!semesterExists) {
      return res
        .status(404)
        .json({ success: false, message: "Semester not found" });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    // Read Excel file
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const insertedStudents = [];

    for (const row of sheetData) {
      const {
        UID,
        "NAME OF STUDENTS": name,
        PASSWORD: password,
        DIVISION: division,
        BATCH: batch,
        GENDER: genderCode,
        "REGULAR/DSY": type,
        CONTACT: contactNumber,
      } = row;

      // Map gender from M/F to enum values
      const gender =
        genderCode === "M" ? "Male" : genderCode === "F" ? "Female" : "Other";

      // Check if student already exists
      const existing = await Student.findOne({ studentId: UID });
      if (existing) continue;

      // Generate email
      const email = generateEmail(name, type);

      // Hash password
      const hashedPassword = await bcrypt.hash(String(password), 10);

      // Create student
      const student = await Student.create({
        name,
        studentId: String(UID),
        email,
        password: hashedPassword,
        division,
        batch,
        contactNumber: contactNumber === "NA" ? "" : contactNumber,
        gender,
      });

      insertedStudents.push(student);

      // Push to allocation where division and batch match
      await Allocation.findOneAndUpdate(
        { division, batch },
        { $push: { students: student._id } },
        { new: true }
      );
    }

    res.status(201).json({
      success: true,
      message: "Students uploaded successfully",
      count: insertedStudents.length,
      students: insertedStudents,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { studentRegister, studentLogin, uploadStudentExcelSheet };
