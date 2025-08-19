"use client"

const TicketConfirmation = ({ booking }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-green-600 text-white p-6 text-center">
        <div className="text-4xl mb-2">🎉</div>
        <h2 className="text-2xl font-bold">Booking Confirmed!</h2>
        <p className="text-green-100">Your tickets have been successfully booked</p>
      </div>

      <div className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-4">Event Details</h3>
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-700">Event:</span>
                <p className="text-gray-900">{booking.eventId.title}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Date & Time:</span>
                <p className="text-gray-900">{formatDate(booking.eventId.date)}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Venue:</span>
                <p className="text-gray-900">{booking.eventId.venue}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Tickets:</span>
                <p className="text-gray-900">{booking.ticketCount} ticket(s)</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Total Amount:</span>
                <p className="text-gray-900 text-xl font-bold">${booking.amountPaid}</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">Your Ticket</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-gray-500 text-sm">Ticket</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">Booking ID</p>
              <p className="font-mono text-lg font-bold">{booking.bookingId}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Important Information:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Please arrive at the venue 30 minutes before the event starts</li>
            <li>• Bring a valid ID along with your ticket</li>
            <li>• Screenshot or print this confirmation for entry</li>
            <li>• Contact support if you need to make any changes</li>
          </ul>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-600 mb-4">A confirmation email has been sent to your registered email address.</p>
          <button onClick={() => window.print()} className="btn-secondary mr-4">
            Print Ticket
          </button>
          <button onClick={() => (window.location.href = "/my-bookings")} className="btn-primary">
            View All Bookings
          </button>
        </div>
      </div>
    </div>
  )
}

export default TicketConfirmation
