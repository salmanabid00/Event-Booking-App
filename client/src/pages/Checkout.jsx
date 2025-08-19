"use client"

import { useState, useEffect } from "react"
import { useParams, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import BookingForm from "../components/BookingForm"
import TicketConfirmation from "../components/TicketConfirmation"
import api from "../utils/api"

const Checkout = () => {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [event, setEvent] = useState(null)
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [step, setStep] = useState("booking") // booking, payment, confirmation
  const ticketCount = location.state?.ticketCount || 1

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login")
      return
    }
    fetchEventAndCreateBooking()
  }, [id, isAuthenticated])

  const fetchEventAndCreateBooking = async () => {
    try {
      setLoading(true)
      // Fetch event details
      const eventResponse = await api.get(`/events/${id}`)
      setEvent(eventResponse.data)

      // Create booking
      const bookingResponse = await api.post("/bookings", {
        eventId: id,
        ticketCount,
      })
      setBooking(bookingResponse.data.booking)
      setStep("payment")
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create booking")
      console.error("Checkout error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = (paymentIntent) => {
    setStep("confirmation")
  }

  const handlePaymentError = (errorMessage) => {
    setError(errorMessage)
  }

  if (!isAuthenticated) {
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={() => navigate(`/events/${id}`)} className="btn-primary">
            Back to Event
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {step === "confirmation" ? (
          <TicketConfirmation booking={booking} />
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6 border-b">
              <h1 className="text-2xl font-bold text-gray-900">Complete Your Booking</h1>
              <div className="mt-4 flex items-center">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    ✓
                  </div>
                  <span className="ml-2 text-sm text-gray-600">Booking Created</span>
                </div>
                <div className="flex-1 h-px bg-gray-300 mx-4"></div>
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step === "payment" ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    2
                  </div>
                  <span className="ml-2 text-sm text-gray-600">Payment</span>
                </div>
                <div className="flex-1 h-px bg-gray-300 mx-4"></div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <span className="ml-2 text-sm text-gray-600">Confirmation</span>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Booking Summary</h2>
                  {event && booking && (
                    <div className="space-y-4">
                      <div className="flex">
                        <img
                          src={event.image || `/placeholder.svg?height=100&width=150&query=event-${event.title}`}
                          alt={event.title}
                          className="w-24 h-16 object-cover rounded"
                        />
                        <div className="ml-4">
                          <h3 className="font-semibold">{event.title}</h3>
                          <p className="text-sm text-gray-600">{event.venue}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(event.date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <div className="flex justify-between mb-2">
                          <span>Tickets ({booking.ticketCount}x)</span>
                          <span>${event.price} each</span>
                        </div>
                        <div className="flex justify-between font-semibold text-lg">
                          <span>Total</span>
                          <span>${booking.amountPaid}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
                  )}
                  {booking && (
                    <BookingForm booking={booking} onSuccess={handlePaymentSuccess} onError={handlePaymentError} />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Checkout
