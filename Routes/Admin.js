const express = require("express");
const {
  adminLogin,
  adminRegister,
  createDepartment,
  addDivision,
  addBatch,
  createSemester,
} = require("../Controllers/Admin");
const router = express.Router();

// Register Routes...
router.post("/register", adminRegister);

// Login Route....
router.post("/login", adminLogin);

// Create Department...
router.post("/create-dpt", createDepartment);

// Add division in department...
router.post("/add-div", addDivision);

// Add Batch in department...
router.post("/add-batch", addBatch);

// Create semester...
router.post("/create-sem", createSemester);

module.exports = router;
