const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const teacherModel = require("../Models/Teacher");
const adminModel = require("../Models/Admin");
const XLSX = require("xlsx");
const Attendance = require("../Models/Attedance");
const Student = require("../Models/Student");
const Subject = require("../Models/Subject");
const moment = require("moment");

// Register Teacher...
const teacherRegister = async (req, res) => {
  try {
    const {
      teacherName,
      teacherEmail,
      teacherPassword,
      teacherGender,
      teacherNumber,
      department,
      createdBy,
    } = req.body;

    // Check admin exist or not..!
    const adminExist = await adminModel.findById(createdBy);
    if (!adminExist) {
      return res
        .status(404)
        .send({ message: "Admin not found..!!", success: false });
    }

    // Check if teacher already exists
    const existing = await teacherModel.findOne({ teacherEmail });
    if (existing) {
      return res.status(400).json({ message: "Teacher already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(teacherPassword, 10);

    // Create and save new teacher
    const newTeacher = new teacherModel({
      teacherName,
      teacherEmail,
      teacherPassword: hashedPassword,
      teacherGender,
      teacherNumber,
      department,
      createdBy,
    });
    const savedTeacher = await newTeacher.save();

    // Update Admin's Teachers array
    await adminModel.findByIdAndUpdate(
      createdBy,
      { $push: { Teachers: savedTeacher._id } },
      { new: true }
    );

    res.status(201).json({
      message: "Teacher registered successfully",
      teacher: savedTeacher,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error registering teacher",
      error,
    });
  }
};

// Login Teacher...
const teacherLogin = async (req, res) => {
  try {
    const { teacherEmail, teacherPassword } = req.body;

    const teacher = await teacherModel.findOne({ teacherEmail });
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const isPasswordValid = await bcrypt.compare(
      teacherPassword,
      teacher.teacherPassword
    );
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // generate JWT token
    const JWT_SECRET = process.env.SECRETKEY || "your_default_secret_key";
    const token = jwt.sign({ teacherId: teacher._id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      message: "Login successful",
      token,
      teacher,
    });
  } catch (error) {
    res.status(500).json({
      message: "Login failed",
      error,
    });
  }
};

// Upload all teacher data through excel sheet...
const uploadTeacherDataExcel = async (req, res) => {  
  try {
    const createdBy = req.body.createdBy;

    // Check admin exist or not..!
    const adminExist = await adminModel.findById(createdBy);
    if (!adminExist) {
      return res.status(404).json({ message: "Admin not found", success: false });
    }

    // Read Excel file
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    let createdTeachers = [];
    for (const row of data) {
      const {
        UID,
        "NAME OF TEACHERS": teacherName,
        PASSWORD: plainPassword,
        GENDER: rawGender,
        DEPARTMENT: department,
        CONTACT: teacherNumber
      } = row;

      // Skip incomplete rows
      if (!teacherName || !plainPassword || !department) continue; 

      // Generate email from name → name.surname@spit.ac.in
      const nameParts = teacherName.trim().toLowerCase().split(/\s+/);
      let teacherEmail = "";
      if (nameParts.length >= 2) {
        teacherEmail = `${nameParts[0]}.${nameParts[nameParts.length - 1]}@spit.ac.in`;
      } else {
        teacherEmail = `${nameParts[0]}@spit.ac.in`;
      }

      // Map gender codes to full form
      let teacherGender = null;
      if (rawGender) {
        const g = rawGender.toString().trim().toUpperCase();
        if (g === "M") teacherGender = "Male";
        else if (g === "F") teacherGender = "Female";
        else if (g === "O") teacherGender = "Other";
      }

      // Avoid duplicates
      const existing = await teacherModel.findOne({ teacherEmail });
      if (existing) continue;

      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      const newTeacher = new teacherModel({
        teacherName,
        teacherEmail,
        teacherPassword: hashedPassword,
        teacherGender,
        teacherNumber: teacherNumber && teacherNumber !== "NA" ? teacherNumber : null,
        department,
        createdBy,
      });

      const savedTeacher = await newTeacher.save();

      // Update teacher id in admin record...
      await adminModel.findByIdAndUpdate(createdBy, {
        $push: { Teachers: savedTeacher._id },
      });
      createdTeachers.push(savedTeacher);
    }

    res.status(201).json({
      message: "Teachers uploaded successfully",
      teachers: createdTeachers,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error uploading teachers", error });
  }
};

// Mark student attendance...
const markAttendance = async (req, res) => {
  try {
    const { studentId, subjectCode, status, type, recordedBy } = req.body;

    if (!studentId || !subjectCode || !status || !type || !recordedBy) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // Find student by custom UID
    const student = await Student.findOne({ studentId });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    // Find subject by code
    const subject = await Subject.findOne({ code: subjectCode });
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found.",
      });
    }

    // Create attendance record
    const attendance = new Attendance({
      studentId: student._id,
      subjectId: subject._id,
      status,
      type,
      recordedBy
    });

    await attendance.save();

    // Push attendance ID into student's record
    student.attedanceRecord.push(attendance._id);
    await student.save();

    res.status(201).json({
      success: true,
      message: "Attendance marked successfully.",
      data: attendance,
    });

  } catch (error) {
    // Handle duplicate key error (Mongo error code 11000)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Attendance already marked for this student today.",
      });
    }

    console.error("Error marking attendance:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// Clear studentAttedance array from student schema...
const clearAttendanceRecordOfStudent = async (req, res) => {
  try {
    const { division } = req.body;

    if (!division) {
      return res.status(400).json({
        success: false,
        message: "Division is required",
      });
    }

    // Update all students in that division
    const result = await Student.updateMany(
      { division }, 
      { $set: { attedanceRecord: [] } }
    );

    res.status(200).json({
      success: true,
      message: `Attendance records cleared for division ${division}.`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error clearing attendance records:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// Mark Student Attendance month wise...
const markAttedanceMonthWise = async (req, res) => {
  try {
    const { subjectCode, type, recordedBy } = req.body;

    if (!subjectCode || !type || !recordedBy) {
      return res.status(400).json({
        success: false,
        message: "subjectCode, type, recordedBy are required.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Excel file is required.",
      });
    }

    // Read Excel
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });

    const subject = await Subject.findOne({ code: subjectCode });
    if (!subject) {
      return res.status(404).json({ success: false, message: "Subject not found" });
    }

    let successCount = 0, failCount = 0;
    const errors = [];

    // Loop through each row (student)
    for (const row of sheetData) {
      const studentId = row["UID"];  
      const student = await Student.findOne({ studentId });

      if (!student) {
        errors.push({ studentId, error: "Student not found" });
        failCount++;
        continue;
      }

      // Loop through each date column (except UID & NAME)
      for (const key of Object.keys(row)) {
        if (key === "UID" || key === "NAME OF STUDENTS") continue;

        let status = row[key];
        if (status === "" || status === null) continue; 
        if (status === "H" || status === "h") continue; 

        // Map Excel values to schema values
        if (status === 1 || status === "1") status = "Present";
        else if (status === 0 || status === "0") status = "Absent";
        else continue; // ignore unknown values

        // Convert header "01-Aug" → proper date
        const year = new Date().getFullYear(); 
        const parsedDate = moment(key + "-" + year, "DD-MMM-YYYY"); 
        const dateStr = parsedDate.format("DD/MM/YYYY"); 
        const targetDate = parsedDate.toDate();

        // Duplicate check using same field as unique index
        const alreadyMarked = await Attendance.findOne({
          studentId: student._id,
          subjectId: subject._id,
          type,
          createdAtDate: dateStr,   
        });

        if (alreadyMarked) {
          errors.push({ studentId, date: key, error: "Already marked" });
          failCount++;
          continue;
        }

        // Save attendance
        const attendance = new Attendance({
          studentId: student._id,
          subjectId: subject._id,
          status,
          type,
          recordedBy,
          date: targetDate,
          createdAtDate: dateStr, 
        });

        await attendance.save();

        student.attedanceRecord.push(attendance._id);
        await student.save();

        successCount++;
      }
    }

    res.status(201).json({
      success: true,
      message: "Attendance uploaded successfully",
      successCount,
      failCount,
      errors,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};



module.exports = { teacherRegister, teacherLogin, uploadTeacherDataExcel, markAttendance,clearAttendanceRecordOfStudent,markAttedanceMonthWise };
