const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    eventType: {
      type: String,
      required: [true, "Event type is required"],
      enum: [
        "Cleanup",
        "Plantation",
        "Donation",
        "Education",
        "Health",
        "Other",
      ],
    },
    imageUrl: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    eventDate: {
      type: Date,
      required: [true, "Event date is required"],
      validate: {
        validator: function (value) {
          return new Date(value) > new Date();
        },
        message: "Event date must be in the future",
      },
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    organizerEmail: {
      type: String,
      required: true,
    },
    organizerName: {
      type: String,
      required: true,
    },
    organizerPhoto: {
      type: String,
      default: "",
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    participantCount: {
      type: Number,
      default: 0,
    },
    maxParticipants: {
      type: Number,
      default: 100,
    },
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      default: "upcoming",
    },
  },
  {
    timestamps: true,
  },
);

// Index for search and filtering
EventSchema.index({ title: "text", description: "text" });
EventSchema.index({ eventType: 1, eventDate: 1 });

module.exports = mongoose.model("Event", EventSchema);
