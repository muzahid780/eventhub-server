const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "EventHub API Server is running!",
    endpoints: {
      health: "/api/health",
      register: "/api/auth/register",
      login: "/api/auth/login",
      events: "/api/events/upcoming",
    },
  });
});

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server running" });
});

// Import Routes
const authRoutes = require("./routes/auth.routes");
const eventRoutes = require("./routes/event.routes");

// Use Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// Start Server
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log(" MongoDB Connected");
    app.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
      console.log(` http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error(" MongoDB Error:", err.message);
    app.listen(PORT, () => {
      console.log(` Server running on port ${PORT} (without DB)`);
    });
  });
