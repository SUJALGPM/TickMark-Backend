const express = require("express");
const bcrypt = require("bcryptjs");
const teacherModel = require("../models/teacherModel"); 

const router = express.Router();

// Register Teacher...
const register = async (req, res) => {
  try {
    const { teacherName, teacherEmail, teacherPassword, teacherGender, teacherNumber, department, createdBy } = req.body;

    // Check if teacher already exists
    const existing = await teacherModel.findOne({ teacherEmail });
    if (existing) {
      return res.status(400).json({ message: "Teacher already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(teacherPassword, 10);

    // Save new teacher
    const newTeacher = new teacherModel({
      teacherName,
      teacherEmail,
      teacherPassword: hashedPassword,
      teacherGender,
      teacherNumber,
      department,
      createdBy
    });

    const savedTeacher = await newTeacher.save();

    res.status(201).json({
      message: "Teacher registered successfully",
      teacher: savedTeacher
    });

  } catch (error) {
    res.status(500).json({
      message: "Error registering teacher",
      error
    });
  }
}

// Login Teacher...
const login = async (req, res) => {
  try {
    const { teacherEmail, teacherPassword } = req.body;

    const teacher = await teacherModel.findOne({ teacherEmail });
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const isPasswordValid = await bcrypt.compare(teacherPassword, teacher.teacherPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Optional: generate JWT token
    const token = jwt.sign({ teacherId: teacher._id }, SECRET_KEY, { expiresIn: "7d" });

    res.status(200).json({
      message: "Login successful",
      token,
      teacher
    });

  } catch (error) {
    res.status(500).json({
      message: "Login failed",
      error
    });
  }
}

module.exports = {register,login}