const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const teacherModel = require("../models/Teacher");

// Register Teacher...
const register = async (req, res) => {
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

    console.log("new teacher :", savedTeacher);

    // Update Admin's Teachers array
    const updatedAdmin = await adminModel.findByIdAndUpdate(
      createdBy,
      { $push: { Teachers: savedTeacher._id } },
      { new: true }
    );

    console.log("udpate admin model :", updatedAdmin);

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
const login = async (req, res) => {
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

module.exports = { register, login };
