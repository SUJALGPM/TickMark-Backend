const Student = require("../Models/Student");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const xlsx = require("xlsx");
const Department = require("../Models/Department");
const Semester = require("../Models/Semester");
const Allocation = require("../Models/Allocation");
const adminModel = require("../Models/Admin");


// Register Student...
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
    } = req.body;

    // 1. Check if student already exists
    const studentExists = await Student.findOne({ studentId });
    if (studentExists) {
      return res
        .status(400)
        .json({ success: false, message: "Student ID already registered" });
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create student
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
    });

    // 4. THEORY allocations
    const theoryAllocations = await Allocation.find({
      type: "Theory",
      division: division,
    });

    // 5. PRACTICAL allocations
    const practicalAllocations = await Allocation.find({
      type: "Practical",
      division: division,
      batch: batch,
    });

    // Combine both
    const allAllocations = [...theoryAllocations, ...practicalAllocations];

    let updatedCount = 0;

    if (allAllocations.length > 0) {
      await Promise.all(
        allAllocations.map(async (alloc) => {
          if (!alloc.students.includes(newStudent._id)) {
            alloc.students.push(newStudent._id);
            await alloc.save();
            updatedCount++;
          }
        })
      );
    }

    // 6. Return success with count
    res.status(201).json({
      success: true,
      message: `Student registered successfully and linked to ${updatedCount} allocation(s)`,
      updatedAllocations: updatedCount,
      student: newStudent,
    });
  } catch (error) {
    console.error("Error in registerStudent:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Login Student...
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

    // Generate JWT token
    const token = jwt.sign(
      { id: student._id, role: "student" },
      process.env.SECRETKEY,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
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
    const { departmentId, semesterId, adminId } = req.body;

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
    let count = 0;

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

      // Push to allocations with new logic
      const cleanDivision = division?.trim();
      const cleanBatch = batch?.trim() || null;

      // Always link to Theory
      await Allocation.updateMany(
        { division: cleanDivision, type: "Theory" },
        { $addToSet: { students: student._id } }
      );

      // Link to Practical if batch is given
      if (cleanBatch) {
        await Allocation.updateMany(
          { division: cleanDivision, batch: cleanBatch, type: "Practical" },
          { $addToSet: { students: student._id } }
        );
      }

      count++;
      console.log(`${count} students uploaded so far...`);
    }

    res.status(201).json({
      success: true,
      message: "Student Uploaded successfully and linked to allocations",
      count: insertedStudents.length,
      students: insertedStudents,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Clear all students from allocations
const clearAllAllocationStudents = async (req, res) => {
  try {
    // $set will replace students array with an empty array
    const result = await Allocation.updateMany({}, { $set: { students: [] } });

    res.status(200).json({
      success: true,
      message: "All student IDs removed from all allocations",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error clearing allocation students:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  studentRegister,
  studentLogin,
  uploadStudentExcelSheet,
  clearAllAllocationStudents,
};
