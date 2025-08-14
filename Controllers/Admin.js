const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../Models/Admin");
const Department = require("../Models/Department");
const Semester = require("../Models/Semester");
const Subject = require("../Models/Subject");
const Teacher = require("../Models/Teacher");
const Allocation = require("../Models/Allocation");

// Register Admin...
const adminRegister = async (req, res) => {
  try {
    const { adminId, adminName, adminPassword, adminGender, adminNumber } =
      req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ adminId });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create admin
    const newAdmin = new Admin({
      adminId,
      adminName,
      adminPassword: hashedPassword,
      adminGender,
      adminNumber,
    });

    await newAdmin.save();
    res.status(201).json({ message: "Admin registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Login Admin...
const adminLogin = async (req, res) => {
  try {
    const { adminId, adminPassword } = req.body;

    const admin = await Admin.findOne({ adminId });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(adminPassword, admin.adminPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create JWT Token
    const token = jwt.sign({ adminId: admin._id }, "your_jwt_secret", {
      expiresIn: "1d",
    });

    res.status(200).json({ message: "Login successful", token, admin });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Create Department...
const createDepartment = async (req, res) => {
  try {
    const { name, adminId } = req.body;

    // Check admin exist or not
    const adminExist = await Admin.findById(adminId);
    if (!adminExist) {
      return res
        .status(404)
        .send({ message: "Admin not found..!!", success: false });
    }

    // Check department exists or not
    const existing = await Department.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: "Department already exists" });
    }

    // Create department
    const newDept = new Department({ name });
    const savedDept = await newDept.save();

    // Push department ID into admin's Departments array
    await Admin.findByIdAndUpdate(
      adminId,
      { $push: { Departments: savedDept._id } },
      { new: true }
    );

    res
      .status(201)
      .json({ message: "Department created", department: savedDept });
  } catch (error) {
    res.status(500).json({ message: "Error creating department", error });
  }
};

// Create Semester...
const createSemester = async (req, res) => {
  try {
    const { semesterNumber, academicYear, dptId, startMonth, endMonth } = req.body;

    // Check department exist or not
    const dptExist = await Department.findById(dptId);
    if (!dptExist) {
      return res
        .status(404)
        .send({ message: "Department not found..!!", success: false });
    }

    // Check if semester already exists for this department and year
    const existing = await Semester.findOne({ 
      semesterNumber, 
      academicYear, 
      departmentId: dptId 
    });
    if (existing) {
      return res.status(400).json({ message: "Semester already exists" });
    }

    // Create new semester
    const newSem = new Semester({
      semesterNumber,
      academicYear,
      departmentId: dptId,
      startMonth,
      endMonth
    });

    const savedSem = await newSem.save();

    // Push semester ID into department's semesters array
    await Department.findByIdAndUpdate(
      dptId,
      { $push: { semesters: savedSem._id } },
      { new: true }
    );

    res.status(201).json({ message: "Semester created", semester: savedSem });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating semester", error });
  }
};
  
// Create Subjects...
const createSubject = async (req, res) => {
  try {
    const { 
      name, 
      code, 
      departmentId, 
      semesterId, 
    } = req.body;

    // Check department exists
    const departmentExists = await Department.findById(departmentId);
    if (!departmentExists) {
      return res.status(404).json({ message: "Department not found" });
    }

    // Check semester exists
    const semesterExists = await Semester.findById(semesterId);
    if (!semesterExists) {
      return res.status(404).json({ message: "Semester not found" });
    }

    // Check if subject code already exists
    const existingSubject = await Subject.findOne({ code });
    if (existingSubject) {
      return res.status(400).json({ message: "Subject code already exists" });
    }

    // Create subject with totalPlanned inside theory/practical
    const newSubject = new Subject({
      name,
      code,
      departmentId,
      semesterId,
    });

    const savedSubject = await newSubject.save();

    // Push subject ID into semester's subjects array
    await Semester.findByIdAndUpdate(
      semesterId,
      { $push: { subjects: savedSubject._id } },
      { new: true }
    );

    res.status(201).json({ 
      message: "Subject created successfully", 
      subject: savedSubject 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create subject", error });
  }
};  

// Allocation of teacher to subjects...
const createAllocation = async (req, res) => {
  try {
    const { adminId, subjectId, teacherId, type, totalPlanned, totalConducted, division, batch } = req.body;

    // Validate admin
    const adminExists = await Admin.findById(adminId);
    if (!adminExists) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    // Validate teacher
    const teacherExists = await Teacher.findById(teacherId);
    if (!teacherExists) {
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }

    // Validate subject
    const subjectExists = await Subject.findById(subjectId);
    if (!subjectExists) {
      return res.status(404).json({ success: false, message: "Subject not found" });
    }

    // Duplicate check
    let duplicateQuery = { subjectId, type };
    if (type === "Theory") {
      duplicateQuery.division = division || null;
    } else if (type === "Practical") {
      if (!division || !batch) {
        return res.status(400).json({ success: false, message: "Division and Batch are required for Practical" });
      }
      duplicateQuery.division = division;
      duplicateQuery.batch = batch;
    } else {
      return res.status(400).json({ success: false, message: "Invalid type. Must be 'Theory' or 'Practical'" });
    }

    const allocationExists = await Allocation.findOne(duplicateQuery);
    if (allocationExists) {
      return res.status(400).json({ success: false, message: "Allocation already exists for this subject/type/division/batch" });
    }

    // Create allocation
    const allocation = new Allocation({
      subjectId,
      teacherId,
      students: [],
      type,
      totalPlanned: totalPlanned || 0,
      totalConducted: totalConducted || 0,
      division: type === "Theory" ? division || null : division,
      batch: type === "Theory" ? null : batch
    });

    await allocation.save();

    // Push allocation into Admin's Allocations array
    adminExists.Allocations.push(allocation._id);
    await adminExists.save();

    res.status(201).json({
      success: true,
      message: "Allocation created and linked to admin successfully",
      data: allocation,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


module.exports = {
  adminRegister,
  adminLogin,
  createDepartment,
  createSemester,
  createSubject,
  createAllocation
};
