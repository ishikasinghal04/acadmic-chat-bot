require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// DB Middleware for Serverless
app.use(async (req, res, next) => {
  if (req.path.startsWith('/api')) {
    await connectDB();
  }
  next();
});

// MODULE: Professional Routing
const chatRoutes = require("./routes/chat.routes");
const apptRoutes = require("./routes/appointment.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const adminRoutes = require("./routes/admin.routes");
const authRoutes = require("./routes/auth.routes");

app.use("/api/chat", chatRoutes);
app.use("/api/appointments", apptRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 3000;

// Database Connection
connectDB();

// Start Server for local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`\n  🚀 AcadBot Enterprise Live`);
    console.log(`  📡 Portal: http://localhost:${PORT}`);
    console.log(`  🛡️ Admin: http://localhost:${PORT}/admin.html\n`);
  });
}

// Export for Vercel
module.exports = app;
