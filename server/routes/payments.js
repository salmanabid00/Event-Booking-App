const express = require("express")
const { createPaymentIntent, handleWebhook, getPaymentStatus } = require("../controllers/paymentController")
const auth = require("../middleware/auth")

const router = express.Router()

// Create payment intent
router.post("/create-payment-intent", auth, createPaymentIntent)

// Stripe webhook (raw body needed)
router.post("/webhook", express.raw({ type: "application/json" }), handleWebhook)

// Get payment status
router.get("/status/:paymentIntentId", auth, getPaymentStatus)

module.exports = router
