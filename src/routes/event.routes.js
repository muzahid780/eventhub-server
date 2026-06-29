const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth.middleware");
const {
  validateEvent,
  validateEventUpdate,
  validateEventId,
  validatePagination,
  handleValidationErrors,
} = require("../middlewares/validation.middleware");
const {
  createEvent,
  getUpcomingEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  joinEvent,
  leaveEvent,
  getJoinedEvents,
  getManageEvents,
} = require("../controllers/event.controller");

// Public routes
router.get(
  "/upcoming",
  validatePagination,
  handleValidationErrors,
  getUpcomingEvents,
);
router.get("/:id", validateEventId, handleValidationErrors, getEventById);

// Private routes
router.post("/", protect, validateEvent, handleValidationErrors, createEvent);
router.put(
  "/:id",
  protect,
  validateEventId,
  validateEventUpdate,
  handleValidationErrors,
  updateEvent,
);
router.delete(
  "/:id",
  protect,
  validateEventId,
  handleValidationErrors,
  deleteEvent,
);

// Join/Leave routes
router.post(
  "/:id/join",
  protect,
  validateEventId,
  handleValidationErrors,
  joinEvent,
);
router.post(
  "/:id/leave",
  protect,
  validateEventId,
  handleValidationErrors,
  leaveEvent,
);

// User specific routes
router.get("/joined/my", protect, getJoinedEvents);
router.get("/manage/my", protect, getManageEvents);

module.exports = router;
