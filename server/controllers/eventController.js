const Event = require("../models/Event")
const { validationResult } = require("express-validator")

const getAllEvents = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query
    const query = {}

    if (category) {
      query.category = category
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { venue: { $regex: search, $options: "i" } },
      ]
    }

    const events = await Event.find(query)
      .populate("createdBy", "name email")
      .sort({ date: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Event.countDocuments(query)

    res.json({
      events,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    })
  } catch (error) {
    console.error("Get events error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate("createdBy", "name email")

    if (!event) {
      return res.status(404).json({ message: "Event not found" })
    }

    res.json(event)
  } catch (error) {
    console.error("Get event error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

const createEvent = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { title, description, date, venue, price, totalTickets, category, image } = req.body

    const event = new Event({
      title,
      description,
      date,
      venue,
      price,
      totalTickets,
      remainingTickets: totalTickets,
      category,
      image,
      createdBy: req.user._id,
    })

    await event.save()
    await event.populate("createdBy", "name email")

    res.status(201).json({
      message: "Event created successfully",
      event,
    })
  } catch (error) {
    console.error("Create event error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

const updateEvent = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const event = await Event.findById(req.params.id)

    if (!event) {
      return res.status(404).json({ message: "Event not found" })
    }

    // Check if user is admin or event creator
    if (req.user.role !== "admin" && event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this event" })
    }

    const { title, description, date, venue, price, totalTickets, category, image } = req.body

    // Update remaining tickets if total tickets changed
    if (totalTickets && totalTickets !== event.totalTickets) {
      const ticketsSold = event.totalTickets - event.remainingTickets
      event.remainingTickets = Math.max(0, totalTickets - ticketsSold)
    }

    Object.assign(event, {
      title: title || event.title,
      description: description || event.description,
      date: date || event.date,
      venue: venue || event.venue,
      price: price !== undefined ? price : event.price,
      totalTickets: totalTickets || event.totalTickets,
      category: category || event.category,
      image: image || event.image,
    })

    await event.save()
    await event.populate("createdBy", "name email")

    res.json({
      message: "Event updated successfully",
      event,
    })
  } catch (error) {
    console.error("Update event error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)

    if (!event) {
      return res.status(404).json({ message: "Event not found" })
    }

    // Check if user is admin or event creator
    if (req.user.role !== "admin" && event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this event" })
    }

    await Event.findByIdAndDelete(req.params.id)

    res.json({ message: "Event deleted successfully" })
  } catch (error) {
    console.error("Delete event error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

const getEventStats = async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments()
    const upcomingEvents = await Event.countDocuments({ date: { $gte: new Date() } })
    const pastEvents = await Event.countDocuments({ date: { $lt: new Date() } })

    const categoryStats = await Event.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ])

    res.json({
      totalEvents,
      upcomingEvents,
      pastEvents,
      categoryStats,
    })
  } catch (error) {
    console.error("Get event stats error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventStats,
}
