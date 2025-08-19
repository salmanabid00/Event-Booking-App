const express = require("express")
const { body } = require("express-validator")
const {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
  confirmBooking,
  getAllBookings,
} = require("../controllers/bookingController")
const auth = require("../middleware/auth")
const admin = require("../middleware/admin")

const router = express.Router()

// Create booking (authenticated users)
router.post(
  "/",
  auth,
  [
    body("eventId").isMongoId().withMessage("Valid event ID is required"),
    body("ticketCount").isInt({ min: 1, max: 10 }).withMessage("Ticket count must be between 1 and 10"),
  ],
  createBooking,
)

// Get user's bookings
router.get("/my-bookings", auth, getUserBookings)

// Get all bookings (admin only)
router.get("/all", auth, admin, getAllBookings)

// Get booking by ID
router.get("/:id", auth, getBookingById)

// Cancel booking
router.patch("/:id/cancel", auth, cancelBooking)

// Confirm booking (internal use)
router.post("/confirm", auth, confirmBooking)

module.exports = router
