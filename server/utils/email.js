const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

const sendBookingConfirmation = async (userEmail, bookingDetails) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: "Booking Confirmation - EventBookingApp",
    html: `
      <h2>Booking Confirmed!</h2>
      <p>Dear ${bookingDetails.userName},</p>
      <p>Your booking has been confirmed for the following event:</p>
      <ul>
        <li><strong>Event:</strong> ${bookingDetails.eventTitle}</li>
        <li><strong>Date:</strong> ${new Date(bookingDetails.eventDate).toLocaleDateString()}</li>
        <li><strong>Venue:</strong> ${bookingDetails.venue}</li>
        <li><strong>Tickets:</strong> ${bookingDetails.ticketCount}</li>
        <li><strong>Total Amount:</strong> $${bookingDetails.amountPaid}</li>
        <li><strong>Booking ID:</strong> ${bookingDetails.bookingId}</li>
      </ul>
      <p>Please keep this booking ID for your records.</p>
      <p>Thank you for choosing EventBookingApp!</p>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log("Booking confirmation email sent")
  } catch (error) {
    console.error("Error sending email:", error)
  }
}

module.exports = { sendBookingConfirmation }
