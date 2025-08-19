const express = require("express")
const { body } = require("express-validator")
const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventStats,
} = require("../controllers/eventController")
const auth = require("../middleware/auth")
const admin = require("../middleware/admin")

const router = express.Router()

// Get all events (public)
router.get("/", getAllEvents)

// Get event by ID (public)
router.get("/:id", getEventById)

// Get event statistics (admin only)
router.get("/admin/stats", auth, admin, getEventStats)

// Create event (admin only)
router.post(
  "/",
  auth,
  admin,
  [
    body("title").trim().isLength({ min: 3 }).withMessage("Title must be at least 3 characters"),
    body("description").trim().isLength({ min: 10 }).withMessage("Description must be at least 10 characters"),
    body("date").isISO8601().withMessage("Please provide a valid date"),
    body("venue").trim().isLength({ min: 3 }).withMessage("Venue must be at least 3 characters"),
    body("price").isNumeric().withMessage("Price must be a number"),
    body("totalTickets").isInt({ min: 1 }).withMessage("Total tickets must be at least 1"),
  ],
  createEvent,
)

// Update event (admin or event creator)
router.put(
  "/:id",
  auth,
  [
    body("title").optional().trim().isLength({ min: 3 }).withMessage("Title must be at least 3 characters"),
    body("description")
      .optional()
      .trim()
      .isLength({ min: 10 })
      .withMessage("Description must be at least 10 characters"),
    body("date").optional().isISO8601().withMessage("Please provide a valid date"),
    body("venue").optional().trim().isLength({ min: 3 }).withMessage("Venue must be at least 3 characters"),
    body("price").optional().isNumeric().withMessage("Price must be a number"),
    body("totalTickets").optional().isInt({ min: 1 }).withMessage("Total tickets must be at least 1"),
  ],
  updateEvent,
)

// Delete event (admin or event creator)
router.delete("/:id", auth, deleteEvent)

module.exports = router
