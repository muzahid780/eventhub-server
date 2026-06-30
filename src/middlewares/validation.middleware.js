const { body, param, query, validationResult } = require("express-validator");

// Validation rules for registration
const validateRegister = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters")
    .isLength({ max: 50 })
    .withMessage("Name cannot exceed 50 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must contain an uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain a lowercase letter"),

  body("photoURL").optional().isURL().withMessage("Please enter a valid URL"),
];

// Validation rules for login
const validateLogin = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("Password is required"),
];

// Validation rules for event creation
const validateEvent = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3 })
    .withMessage("Title must be at least 3 characters")
    .isLength({ max: 100 })
    .withMessage("Title cannot exceed 100 characters"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters")
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters"),

  body("eventType")
    .notEmpty()
    .withMessage("Event type is required")
    .isIn(["Cleanup", "Plantation", "Donation", "Education", "Health", "Other"])
    .withMessage("Invalid event type"),

  body("imageUrl")
    .trim()
    .notEmpty()
    .withMessage("Image URL is required")
    .isURL()
    .withMessage("Please enter a valid URL"),

  body("location").trim().notEmpty().withMessage("Location is required"),

  body("eventDate")
    .notEmpty()
    .withMessage("Event date is required")
    .isISO8601()
    .withMessage("Invalid date format")
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error("Event date must be in the future");
      }
      return true;
    }),
];

// Validation rules for event update
const validateEventUpdate = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage("Title must be at least 3 characters")
    .isLength({ max: 100 })
    .withMessage("Title cannot exceed 100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters")
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters"),

  body("eventType")
    .optional()
    .isIn(["Cleanup", "Plantation", "Donation", "Education", "Health", "Other"])
    .withMessage("Invalid event type"),

  body("imageUrl")
    .optional()
    .trim()
    .isURL()
    .withMessage("Please enter a valid URL"),

  body("location").optional().trim(),

  body("eventDate")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format")
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error("Event date must be in the future");
      }
      return true;
    }),
];

// Validation rules for event ID param
const validateEventId = [
  param("id")
    .notEmpty()
    .withMessage("Event ID is required")
    .isMongoId()
    .withMessage("Invalid event ID format"),
];

// Validation rules for pagination
const validatePagination = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer")
    .toInt(),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50")
    .toInt(),

  query("search").optional().trim(),

  query("eventType").optional().trim(),
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errorMessages,
    });
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateEvent,
  validateEventUpdate,
  validateEventId,
  validatePagination,
  handleValidationErrors,
};
