const Booking = require("../models/Booking")
const Event = require("../models/Event")
const User = require("../models/User")
const { validationResult } = require("express-validator")
const { sendBookingConfirmation } = require("../utils/email")

const createBooking = async (req, res) => {
  try {
    console.log("[v0] Create booking request received")
    console.log("[v0] Request body:", req.body)
    console.log("[v0] User from auth middleware:", req.user ? req.user._id : "No user found")

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      console.log("[v0] Validation errors:", errors.array())
      return res.status(400).json({ errors: errors.array() })
    }

    const { eventId, ticketCount } = req.body
    const userId = req.user._id

    console.log("[v0] Looking for event with ID:", eventId)
    // Find the event
    const event = await Event.findById(eventId)
    if (!event) {
      console.log("[v0] Event not found")
      return res.status(404).json({ message: "Event not found" })
    }

    console.log("[v0] Event found:", event.title)

    // Check if event is in the future
    if (new Date(event.date) < new Date()) {
      console.log("[v0] Event is in the past")
      return res.status(400).json({ message: "Cannot book tickets for past events" })
    }

    // Check ticket availability
    if (event.remainingTickets < ticketCount) {
      console.log("[v0] Not enough tickets available")
      return res.status(400).json({ message: "Not enough tickets available" })
    }

    // Calculate total amount
    const amountPaid = event.price * ticketCount
    console.log("[v0] Creating booking with amount:", amountPaid)

    // Create booking
    const booking = new Booking({
      userId,
      eventId,
      ticketCount,
      amountPaid,
      paymentStatus: "pending",
    })

    console.log("[v0] Saving booking...")
    await booking.save()
    console.log("[v0] Booking saved successfully")

    // Populate booking with event and user details
    await booking.populate([
      { path: "eventId", select: "title date venue price" },
      { path: "userId", select: "name email" },
    ])

    console.log("[v0] Booking populated and ready to send")
    res.status(201).json({
      message: "Booking created successfully",
      booking,
    })
  } catch (error) {
    console.error("[v0] Create booking error:", error)
    console.error("[v0] Error stack:", error.stack)
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate("eventId", "title date venue price image")
      .sort({ createdAt: -1 })

    res.json(bookings)
  } catch (error) {
    console.error("Get user bookings error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("eventId", "title date venue price image")
      .populate("userId", "name email")

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" })
    }

    // Check if user owns this booking or is admin
    if (booking.userId._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to view this booking" })
    }

    res.json(booking)
  } catch (error) {
    console.error("Get booking error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("eventId")

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" })
    }

    // Check if user owns this booking
    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to cancel this booking" })
    }

    // Check if booking is already cancelled
    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Booking is already cancelled" })
    }

    // Check if event is in the future (allow cancellation only for future events)
    if (new Date(booking.eventId.date) < new Date()) {
      return res.status(400).json({ message: "Cannot cancel booking for past events" })
    }

    // Update booking status
    booking.status = "cancelled"
    booking.paymentStatus = "refunded"
    await booking.save()

    // Return tickets to event
    await Event.findByIdAndUpdate(booking.eventId._id, {
      $inc: { remainingTickets: booking.ticketCount },
    })

    res.json({ message: "Booking cancelled successfully" })
  } catch (error) {
    console.error("Cancel booking error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

const confirmBooking = async (req, res) => {
  try {
    const { bookingId, paymentIntentId } = req.body

    const booking = await Booking.findById(bookingId).populate("eventId").populate("userId")

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" })
    }

    // Update booking status
    booking.paymentStatus = "completed"
    booking.stripePaymentIntentId = paymentIntentId
    await booking.save()

    // Reduce available tickets
    await Event.findByIdAndUpdate(booking.eventId._id, {
      $inc: { remainingTickets: -booking.ticketCount },
    })

    // Add booking to user's bookings array
    await User.findByIdAndUpdate(booking.userId._id, {
      $push: { bookings: booking._id },
    })

    try {
      await sendBookingConfirmation(booking.userId.email, {
        userName: booking.userId.name,
        eventTitle: booking.eventId.title,
        eventDate: booking.eventId.date,
        venue: booking.eventId.venue,
        ticketCount: booking.ticketCount,
        amountPaid: booking.amountPaid,
        bookingId: booking.bookingId,
      })
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError)
      // Don't fail the booking if email fails
    }

    res.json({ message: "Booking confirmed successfully", booking })
  } catch (error) {
    console.error("Confirm booking error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

const getAllBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, eventId } = req.query
    const query = {}

    if (status) query.paymentStatus = status
    if (eventId) query.eventId = eventId

    const bookings = await Booking.find(query)
      .populate("eventId", "title date venue")
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Booking.countDocuments(query)

    res.json({
      bookings,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    })
  } catch (error) {
    console.error("Get all bookings error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

module.exports = {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
  confirmBooking,
  getAllBookings,
}
