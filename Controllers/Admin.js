const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../Models/Admin");
const Department = require("../models/Department");
const Semester = require("../Models/Semester");
const Subject = require("../Models/Subject");

// Register Admin...
const adminRegister = async (req, res) => {
  try {
    const { adminId, adminName, adminPassword, adminGender, adminNumber } = req.body;

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
      adminNumber
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
      expiresIn: "1d"
    });

    res.status(200).json({ message: "Login successful", token, admin });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Create Department...
const createDepartment = async (req, res) => {
  try {
    const { name } = req.body;

    const existing = await Department.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: "Department already exists" });
    }

    const newDept = new Department({ name });
    await newDept.save();

    res.status(201).json({ message: "Department created", department: newDept });
  } catch (error) {
    res.status(500).json({ message: "Error creating department", error });
  }
};

// Add Division in department...
const addDivision = async (req, res) => {
    try {
        const { departmentId, divisionName } = req.body;

        if (!departmentId || !divisionName) {
            return res.status(400).json({ message: "Department ID and Division Name required" });
        }

        const dept = await Department.findById(departmentId);
        if (!dept) return res.status(404).json({ message: "Department not found" });

        // Prevent duplicate
        if (dept.divisions.includes(divisionName)) {
            return res.status(400).json({ message: "Division already exists" });
        }

        dept.divisions.push(divisionName);
        await dept.save();

        res.status(200).json({ message: "Division added", department: dept });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error adding division" });
    }
};

// Add Batch in department...
const addBatch = async (req, res) => {
    try {
        const { departmentId, batchName } = req.body;

        if (!departmentId || !batchName) {
            return res.status(400).json({ message: "Department ID and Batch Name required" });
        }

        const dept = await Department.findById(departmentId);
        if (!dept) return res.status(404).json({ message: "Department not found" });

        // Prevent duplicate
        if (dept.batches.includes(batchName)) {
            return res.status(400).json({ message: "Batch already exists" });
        }

        dept.batches.push(batchName);
        await dept.save();

        res.status(200).json({ message: "Batch added", department: dept });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error adding batch" });
    }
};

// Create Semester...
const createSemester = async (req, res) => {
  try {
    const { name } = req.body;

    const existing = await Semester.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: "Semester already exists" });
    }

    const newSem = new Semester({ name });
    await newSem.save();

    res.status(201).json({ message: "Semester created", semester: newSem });
  } catch (error) {
    res.status(500).json({ message: "Error creating semester", error });
  }
};

// Create Subjects...
const createSubject = async (req, res) => {
  try {
    const { name, subjectType, department, semester, assignedTeacher } = req.body;

    const subject = new Subject({
      name,
      subjectType,
      department,
      semester,
      assignedTeacher
    });

    await subject.save();

    res.status(201).json({ message: "Subject created successfully", subject });
  } catch (error) {
    res.status(500).json({ message: "Failed to create subject", error });
  }
};




module.exports = {adminRegister,adminLogin,createDepartment,addBatch,addDivision,createSemester,createSubject}