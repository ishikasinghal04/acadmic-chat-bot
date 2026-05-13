/**
 * MODULE: AcadBot Enterprise Production Server
 * Modularized Architecture for Scalability & Security.
 */
const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

// MODULE: Route Imports
const chatRoutes = require("./routes/chatRoutes");
const apptRoutes = require("./routes/apptRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// MODULE: Database Connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/academic-advisor";
mongoose.connect(MONGODB_URI)
  .then(() => console.log("🌱 Connected to MongoDB Successfully"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// MODULE: API Routing
app.use("/api/chat", chatRoutes);
app.use("/api/appointments", apptRoutes);
app.use("/api/analytics", analyticsRoutes);

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => console.log(`🚀 AcadBot Enterprise live on port ${PORT}`));
}

module.exports = app;
