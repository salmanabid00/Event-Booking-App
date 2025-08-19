require("dotenv").config()
const express = require("express")
const cors = require("cors")
const connectDB = require("./config/database")

// Import routes
const authRoutes = require("./routes/auth")
const eventRoutes = require("./routes/events")
const bookingRoutes = require("./routes/bookings")
const paymentRoutes = require("./routes/payments")

const app = express()

// Connect to database
connectDB()

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/events", eventRoutes)
app.use("/api/bookings", bookingRoutes)
app.use("/api/payments", paymentRoutes)

app.get("/", (req, res) => {
  res.json({
    message: "EventBookingApp Backend Server",
    status: "Running",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      events: "/api/events",
      bookings: "/api/bookings",
      payments: "/api/payments",
    },
  })
})

// Health check
app.get("/api/health", (req, res) => {
  res.json({ message: "EventBookingApp API is running!" })
})

app.use((err, req, res, next) => {
  console.error("[v0] Unhandled error:", err)
  res.status(500).json({
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
