const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
const Booking = require("../models/Booking")
const Event = require("../models/Event")
const User = require("../models/User")
const { sendBookingConfirmation } = require("../utils/email")

const createPaymentIntent = async (req, res) => {
  try {
    const { bookingId } = req.body

    const booking = await Booking.findById(bookingId).populate("eventId")
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" })
    }

    // Check if user owns this booking
    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" })
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(booking.amountPaid * 100), // Convert to cents
      currency: "usd",
      metadata: {
        bookingId: booking._id.toString(),
        eventId: booking.eventId._id.toString(),
        userId: req.user._id.toString(),
      },
    })

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error) {
    console.error("Create payment intent error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

const handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"]
  let event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object
      const { bookingId } = paymentIntent.metadata

      try {
        const booking = await Booking.findById(bookingId).populate("eventId").populate("userId")

        if (booking) {
          // Update booking status
          booking.paymentStatus = "completed"
          booking.stripePaymentIntentId = paymentIntent.id
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
          }

          console.log("Payment succeeded and booking confirmed:", bookingId)
        }
      } catch (error) {
        console.error("Error processing payment success:", error)
      }
      break

    case "payment_intent.payment_failed":
      const failedPayment = event.data.object
      const { bookingId: failedBookingId } = failedPayment.metadata

      try {
        await Booking.findByIdAndUpdate(failedBookingId, {
          paymentStatus: "failed",
        })
        console.log("Payment failed for booking:", failedBookingId)
      } catch (error) {
        console.error("Error processing payment failure:", error)
      }
      break

    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  res.json({ received: true })
}

const getPaymentStatus = async (req, res) => {
  try {
    const { paymentIntentId } = req.params

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    res.json({
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
    })
  } catch (error) {
    console.error("Get payment status error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

module.exports = {
  createPaymentIntent,
  handleWebhook,
  getPaymentStatus,
}
