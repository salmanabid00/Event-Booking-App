"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import api from "../utils/api"

const EventDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [ticketCount, setTicketCount] = useState(1)

  useEffect(() => {
    fetchEvent()
  }, [id])

  const fetchEvent = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/events/${id}`)
      setEvent(response.data)
    } catch (error) {
      setError("Failed to fetch event details")
      console.error("Fetch event error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleBookNow = () => {
    if (!isAuthenticated) {
      navigate("/login")
      return
    }
    navigate(`/checkout/${id}`, { state: { ticketCount } })
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h2>
          <p className="text-gray-600 mb-4">{error || "The event you're looking for doesn't exist."}</p>
          <button onClick={() => navigate("/")} className="btn-primary">
            Back to Events
          </button>
        </div>
      </div>
    )
  }

  const isEventPast = new Date(event.date) < new Date()
  const isSoldOut = event.remainingTickets === 0
  const maxTickets = Math.min(event.remainingTickets, 10)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2">
              <img
                src={event.image || `/placeholder.svg?height=400&width=600&query=event-${event.title}`}
                alt={event.title}
                className="w-full h-64 md:h-full object-cover"
              />
            </div>
            <div className="md:w-1/2 p-8">
              <div className="flex items-center justify-between mb-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    event.category === "VIP" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {event.category}
                </span>
                {isEventPast && <span className="text-red-600 font-semibold">Event Ended</span>}
                {isSoldOut && !isEventPast && <span className="text-red-600 font-semibold">Sold Out</span>}
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>
              <p className="text-gray-600 mb-6">{event.description}</p>

              <div className="space-y-4 mb-6">
                <div className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {formatDate(event.date)}
                </div>
                <div className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {event.venue}
                </div>
                <div className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  {event.remainingTickets} of {event.totalTickets} tickets remaining
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-bold text-blue-600">${event.price}</span>
                  <span className="text-gray-500">per ticket</span>
                </div>

                {!isEventPast && !isSoldOut && (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="ticketCount" className="block text-sm font-medium text-gray-700 mb-2">
                        Number of tickets
                      </label>
                      <select
                        id="ticketCount"
                        className="input-field w-32"
                        value={ticketCount}
                        onChange={(e) => setTicketCount(Number.parseInt(e.target.value))}
                      >
                        {Array.from({ length: maxTickets }, (_, i) => i + 1).map((num) => (
                          <option key={num} value={num}>
                            {num}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center justify-between text-lg font-semibold">
                      <span>Total: ${(event.price * ticketCount).toFixed(2)}</span>
                    </div>

                    <button onClick={handleBookNow} className="w-full btn-primary text-lg py-3">
                      {isAuthenticated ? "Book Now" : "Login to Book"}
                    </button>
                  </div>
                )}

                {(isEventPast || isSoldOut) && (
                  <button
                    disabled
                    className="w-full bg-gray-300 text-gray-500 py-3 rounded-lg font-medium cursor-not-allowed"
                  >
                    {isEventPast ? "Event Ended" : "Sold Out"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventDetails
