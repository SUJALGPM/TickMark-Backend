const express = require("express");
const {
  adminLogin,
  adminRegister,
  createDepartment,
  addDivision,
  addBatch,
  createSemester,
  createSubject,
  createAllocation,
} = require("../Controllers/Admin");
const router = express.Router();

// Register Routes...
router.post("/register", adminRegister);

// Login Route....
router.post("/login", adminLogin);

// Create Department...
router.post("/create-dpt", createDepartment);

// Create semester...
router.post("/create-sem", createSemester);

// Create subject...
router.post("/create-sub", createSubject);

// Create allocation...
router.post("/create-alloc", createAllocation);


module.exports = router;
