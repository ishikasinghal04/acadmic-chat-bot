/**
 * MODULE: AcadBot Enterprise Server
 * Core intelligence engine with MongoDB persistence and AI integration.
 */
const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

// MODULE: Models
const Appointment = require("./models/Appointment");
const Chat = require("./models/Chat");
const Stream = require("./models/Stream");
const knowledgeBase = require("./knowledgeBase");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// MODULE: Database Connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/academic-advisor";
mongoose.connect(MONGODB_URI)
  .then(() => console.log("🌱 Connected to MongoDB Successfully"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// MODULE: Chatbot API Engine
app.post("/api/chat", async (req, res) => {
  const { message, history, studentId } = req.body;

  // 1. Sentiment & Analytics Logic
  const sensitiveKeywords = ["fail", "stress", "tension", "burnout", "dropout", "depressed"];
  const isHighPriority = sensitiveKeywords.some(word => message.toLowerCase().includes(word));
  
  let category = "GENERAL_QUERY";
  const lowerMsg = message.toLowerCase();
  if (lowerMsg.includes("course") || lowerMsg.includes("stream")) category = "COURSE_QUERY";
  if (lowerMsg.includes("placement") || lowerMsg.includes("career")) category = "CAREER_QUERY";
  if (lowerMsg.includes("book") || lowerMsg.includes("appointment")) category = "APPOINTMENT_QUERY";
  if (isHighPriority) category = "EMOTIONAL_SUPPORT";

  // 2. AI Context
  const kbString = Object.values(knowledgeBase.streams)
    .map(s => `${s.name} Paths: ${s.paths.map(p => `${p.title} (${p.courses.join(", ")})`).join("; ")}`)
    .join("\n");

  const SYSTEM_PROMPT = `You are AcadBot, a high-level AI Student Academic Advisor.
  CONTEXT: ${kbString}
  PROTOCOLS:
  - Sentiment Gatekeeper: If keywords like stress/fail are used, show empathy FIRST.
  - Analytics: End every response with [DB_LOG: CATEGORY] based on user intent.
  - Appointments: Ask for Student ID and offer: Mon 10AM, Wed 2PM, Fri 11AM.
  - Domain: Cover Science, Commerce, Arts. Suggest one Wildcard Emerging Career.
  - Tone: Multilingual (Hinglish), Bold tags, [SUGGESTED]: Topic chips.`;

  const contents = (history || []).map(msg => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }]
  }));
  contents.push({ role: "user", parts: [{ text: message }] });

  try {
    // 3. User Persistence & Log
    if (studentId) {
      await Chat.findOneAndUpdate(
        { userName: studentId },
        { $push: { messages: { role: "user", content: message, category, isHighPriority } } },
        { upsert: true }
      );
    }

    const aiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: contents,
        }),
      }
    );
    
    const aiData = await aiRes.json();
    const botResponse = aiData.candidates[0].content.parts[0].text;

    if (studentId) {
      await Chat.findOneAndUpdate(
        { userName: studentId },
        { $push: { messages: { role: "assistant", content: botResponse } } }
      );
    }

    res.json({ response: botResponse, category, isHighPriority });
  } catch (err) {
    res.status(500).json({ error: "AI Busy" });
  }
});

// MODULE: Appointment Management
app.post("/api/appointments", async (req, res) => {
  const { name, email, date, time, reason, studentId } = req.body;
  try {
    const existing = await Appointment.findOne({ date, time });
    if (existing) return res.status(400).json({ error: "Slot already booked." });

    const appt = new Appointment({ name, email, studentId, date, time, reason });
    await appt.save();
    res.json({ message: "Success", appointment: appt });
  } catch (err) {
    res.status(500).json({ error: "DB Error" });
  }
});

app.get("/api/appointments", async (req, res) => {
  try {
    const list = await Appointment.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: "DB Error" });
  }
});

// MODULE: Analytics API
app.get("/api/analytics/trends", async (req, res) => {
  try {
    const stats = await Chat.aggregate([
      { $unwind: "$messages" },
      { $group: { _id: "$messages.category", count: { $sum: 1 } } }
    ]);
    const priorityCount = await Chat.countDocuments({ "messages.isHighPriority": true });
    res.json({ stats, priorityCount });
  } catch (err) {
    res.status(500).json({ error: "Analytics Error" });
  }
});

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => console.log(`🚀 AcadBot Server live on port ${PORT}`));
}

module.exports = app;
