const mongoose = require("mongoose")

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    ticketCount: {
      type: Number,
      required: true,
      min: 1,
    },
    amountPaid: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    stripePaymentIntentId: {
      type: String,
    },
    bookingId: {
      type: String,
      unique: true,
    },
    status: {
      type: String,
      enum: ["active", "cancelled"],
      default: "active",
    },
  },
  {
    timestamps: true,
  },
)

// Generate unique booking ID
bookingSchema.pre("save", function (next) {
  if (!this.bookingId) {
    this.bookingId = "BK" + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase()
  }
  next()
})

module.exports = mongoose.model("Booking", bookingSchema)
