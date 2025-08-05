const express = require("express");
const { register, login } = require("../Controllers/Teacher");
const router = express.Router();

// Register Routes...
router.post("/register", register);

// Login Route....
router.post("/login", login);

module.exports = router;
