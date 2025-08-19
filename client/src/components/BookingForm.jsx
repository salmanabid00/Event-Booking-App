"use client"

import { useState } from "react"
import api from "../utils/api"

const BookingForm = ({ booking, onSuccess, onError }) => {
  const [processing, setProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("card")

  const handleSubmit = async (event) => {
    event.preventDefault()
    setProcessing(true)

    try {
      // Simulate payment processing for now
      const response = await api.post("/bookings/confirm", {
        bookingId: booking._id,
        paymentMethod: paymentMethod,
        // For demo purposes, we'll simulate a successful payment
        paymentIntentId: `pi_demo_${Date.now()}`,
      })

      onSuccess({
        id: `pi_demo_${Date.now()}`,
        status: "succeeded",
        amount: booking.amountPaid * 100,
      })
    } catch (error) {
      onError(error.response?.data?.message || "Booking confirmation failed")
    } finally {
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Payment Details</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="card">Credit/Debit Card</option>
              <option value="paypal">PayPal</option>
              <option value="bank">Bank Transfer</option>
            </select>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Demo Mode:</strong> This is a simplified booking form. In production, integrate with Stripe or
              your preferred payment processor.
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Booking Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Event:</span>
                <span>{booking.event?.title || "Event"}</span>
              </div>
              <div className="flex justify-between">
                <span>Tickets:</span>
                <span>{booking.ticketQuantity}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <span>${booking.amountPaid}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={processing}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {processing ? "Processing..." : `Confirm Booking - $${booking.amountPaid}`}
      </button>
    </form>
  )
}

export default BookingForm
