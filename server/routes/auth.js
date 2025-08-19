const express = require("express")
const { body } = require("express-validator")
const { register, login, getProfile } = require("../controllers/authController")
const auth = require("../middleware/auth")

const router = express.Router()

// Register route
router.post(
  "/register",
  [
    body("name").trim().isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  register,
)

// Login route
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password").exists().withMessage("Password is required"),
  ],
  login,
)

// Get user profile
router.get("/profile", auth, getProfile)

module.exports = router
