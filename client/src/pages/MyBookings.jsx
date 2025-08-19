"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import api from "../utils/api"

const MyBookings = () => {
  const { isAuthenticated } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings()
    }
  }, [isAuthenticated])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const response = await api.get("/bookings/my-bookings")
      setBookings(response.data)
    } catch (error) {
      setError("Failed to fetch bookings")
      console.error("Fetch bookings error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return
    }

    try {
      await api.patch(`/bookings/${bookingId}/cancel`)
      fetchBookings() // Refresh bookings
    } catch (error) {
      alert(error.response?.data?.message || "Failed to cancel booking")
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      case "refunded":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Bookings</h1>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No bookings found</h3>
            <p className="text-gray-500 mb-4">You haven't booked any events yet</p>
            <a href="/" className="btn-primary">
              Browse Events
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start space-x-4">
                      <img
                        src={
                          booking.eventId?.image ||
                          `/placeholder.svg?height=80&width=120&query=event-${booking.eventId?.title || "deleted-event"}`
                        }
                        alt={booking.eventId?.title || "Event"}
                        className="w-20 h-16 object-cover rounded"
                      />
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {booking.eventId?.title || "Event Deleted"}
                        </h3>
                        <p className="text-gray-600">{booking.eventId?.venue || "Venue not available"}</p>
                        <p className="text-gray-600">
                          {booking.eventId?.date ? formatDate(booking.eventId.date) : "Date not available"}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm text-gray-500">
                            {booking.ticketCount} ticket{booking.ticketCount > 1 ? "s" : ""}
                          </span>
                          <span className="text-sm font-semibold">${booking.amountPaid}</span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              booking.paymentStatus,
                            )}`}
                          >
                            {booking.paymentStatus}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 md:mt-0 flex flex-col space-y-2">
                      <span className="text-sm text-gray-500">Booking ID: {booking.bookingId}</span>
                      {booking.status === "active" &&
                        booking.paymentStatus === "completed" &&
                        booking.eventId?.date &&
                        new Date(booking.eventId.date) > new Date() && (
                          <button
                            onClick={() => handleCancelBooking(booking._id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Cancel Booking
                          </button>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyBookings
