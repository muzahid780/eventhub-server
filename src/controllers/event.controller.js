const Event = require("../models/Event.model");
const Participant = require("../models/Participant.model");
const User = require("../models/User.model");

// @desc    Create new event
const createEvent = async (req, res) => {
  try {
    const { title, description, eventType, imageUrl, location, eventDate } =
      req.body;

    const event = await Event.create({
      title,
      description,
      eventType,
      imageUrl,
      location,
      eventDate,
      organizer: req.user._id,
      organizerEmail: req.user.email,
      organizerName: req.user.name,
      organizerPhoto: req.user.photoURL,
    });

    await User.findByIdAndUpdate(req.user._id, {
      $push: { createdEvents: event._id },
    });

    res.status(201).json({
      success: true,
      message: "Event created successfully! ",
      event,
    });
  } catch (error) {
    console.error("Create event error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create event",
    });
  }
};

// @desc    Get all upcoming events with search & filter
const getUpcomingEvents = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", eventType = "" } = req.query;

    const query = {
      eventDate: { $gt: new Date() },
      status: "upcoming",
    };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (eventType) {
      query.eventType = eventType;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [events, total] = await Promise.all([
      Event.find(query)
        .sort({ eventDate: 1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate("organizer", "name email photoURL"),
      Event.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: events.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      events,
    });
  } catch (error) {
    console.error("Get upcoming events error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get events",
    });
  }
};

// @desc    Get event by ID
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("organizer", "name email photoURL")
      .populate("participants", "name email photoURL");

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      event,
    });
  } catch (error) {
    console.error("Get event error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get event",
    });
  }
};

// @desc    Update event
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this event",
      });
    }

    if (new Date(event.eventDate) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Cannot update past events",
      });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );

    res.status(200).json({
      success: true,
      message: "Event updated successfully! ",
      event: updatedEvent,
    });
  } catch (error) {
    console.error("Update event error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update event",
    });
  }
};

// @desc    Delete event
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this event",
      });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { createdEvents: event._id },
    });

    await Participant.deleteMany({ event: event._id });
    await event.deleteOne();

    res.status(200).json({
      success: true,
      message: "Event deleted successfully! ",
    });
  } catch (error) {
    console.error("Delete event error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete event",
    });
  }
};

// @desc    Join event
const joinEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (new Date(event.eventDate) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Cannot join past events",
      });
    }

    const existingParticipant = await Participant.findOne({
      event: event._id,
      user: req.user._id,
    });

    if (existingParticipant) {
      return res.status(400).json({
        success: false,
        message: "You have already joined this event",
      });
    }

    if (event.participantCount >= event.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: "Event is full",
      });
    }

    const participant = await Participant.create({
      event: event._id,
      user: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      userPhoto: req.user.photoURL,
    });

    await Event.findByIdAndUpdate(event._id, {
      $push: { participants: req.user._id },
      $inc: { participantCount: 1 },
    });

    await User.findByIdAndUpdate(req.user._id, {
      $push: { joinedEvents: event._id },
    });

    res.status(200).json({
      success: true,
      message: "Successfully joined the event! ",
      participant,
    });
  } catch (error) {
    console.error("Join event error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to join event",
    });
  }
};

// @desc    Leave event
const leaveEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const participant = await Participant.findOne({
      event: event._id,
      user: req.user._id,
    });

    if (!participant) {
      return res.status(400).json({
        success: false,
        message: "You have not joined this event",
      });
    }

    await Participant.findByIdAndDelete(participant._id);

    await Event.findByIdAndUpdate(event._id, {
      $pull: { participants: req.user._id },
      $inc: { participantCount: -1 },
    });

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { joinedEvents: event._id },
    });

    res.status(200).json({
      success: true,
      message: "Left the event successfully",
    });
  } catch (error) {
    console.error("Leave event error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to leave event",
    });
  }
};

// @desc    Get joined events
const getJoinedEvents = async (req, res) => {
  try {
    const events = await Event.find({
      participants: req.user._id,
      eventDate: { $gt: new Date() },
    })
      .sort({ eventDate: 1 })
      .populate("organizer", "name email photoURL");

    res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    console.error("Get joined events error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get joined events",
    });
  }
};

// @desc    Get manage events (created by user)
const getManageEvents = async (req, res) => {
  try {
    const events = await Event.find({
      organizer: req.user._id,
    })
      .sort({ createdAt: -1 })
      .populate("organizer", "name email photoURL");

    res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    console.error("Get manage events error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get your events",
    });
  }
};

module.exports = {
  createEvent,
  getUpcomingEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  joinEvent,
  leaveEvent,
  getJoinedEvents,
  getManageEvents,
};
