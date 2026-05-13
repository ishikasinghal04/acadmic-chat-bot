/**
 * MODULE: Backend Server Configuration
 * This file handles the Express server setup, API endpoints for the chatbot,
 * and integration with the Gemini AI model.
 */

const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

// MODULE: Data & Models
const knowledgeBase = require("./knowledgeBase");
const Appointment = require("./models/Appointment");
const Chat = require("./models/Chat");

const app = express();

// MODULE: Middleware Setup
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// MODULE: MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/academic-advisor";
mongoose.connect(MONGODB_URI)
  .then(() => console.log("🌱 Connected to MongoDB Successfully"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// MODULE: Chatbot API Engine
app.post("/api/chat", async (req, res) => {
  const { message, history } = req.body;
  // ... (rest of the chat logic remains same for now)

// MODULE: Chatbot API Engine
// Endpoint to handle user messages and generate AI responses using Gemini API
app.post("/api/chat", async (req, res) => {
  const { message, history } = req.body;

  // Process knowledge base into a context string for the AI model
  const kbString = Object.values(knowledgeBase.streams)
    .map(s => `${s.name} Paths: ${s.paths.map(p => `${p.title} (${p.courses.join(", ")})`).join("; ")}`)
    .join("\n");

  // SYSTEM_PROMPT: Defines the AI's persona, knowledge, and operational rules
  const SYSTEM_PROMPT = `You are AcadBot, a high-level AI Student Academic Advisor. Your mission is to provide personalized guidance while maintaining student well-being.
  
  KNOWLEDGE BASE CONTEXT:
  ${kbString}

  CORE PROTOCOLS:
  1. **Sentiment Analysis Gatekeeper**: If keywords like 'fail', 'stress', 'tension', or 'burnout' are used, prioritize an Empathy Block. Acknowledge feelings first.
  2. **Analytics Tags**: Append a hidden tag at the end of EVERY response, e.g., [DB_LOG: COURSE_QUERY], [DB_LOG: EMOTIONAL_SUPPORT], [DB_LOG: APPOINTMENT].
  3. **Appointment Module**: Proactively ask for Student ID and offer slots: Mon 10AM, Wed 2PM, Fri 11AM.
  4. **Domain**: Cover Science, Commerce, Arts. ALWAYS suggest one wildcard 'Emerging Career' (e.g., Prompt Engineering, Drone Tech).
  5. **Boundaries**: No medical advice. Refer policy/fee queries to admin.
  
  TONE & FORMAT:
  - Adaptive multilingual (Hindi/English/Hinglish).
  - Use bold topic tags, concise bullet points, and [SUGGESTED]: Topic for chips.
  - End with a helpful follow-up question.`;


  // Constructing conversation history for context-aware responses
  const contents = [];
  if (history && history.length > 0) {
    for (const msg of history) {
      contents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      });
    }
  }

  contents.push({
    role: "user",
    parts: [{ text: message }],
  });

  try {
    // API Call to Google Generative AI (Gemini)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: SYSTEM_PROMPT }],
          },
          contents: contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800,
          },
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const reply = data.candidates[0].content.parts[0].text;
    res.json({ reply });
  } catch (err) {
    console.error("API Error:", err);
    res.status(500).json({ error: "Service unavailable. Please try again later." });
  }
});

// MODULE: Appointment Management API
// Endpoint to save new appointment details to MongoDB
app.post("/api/appointments", async (req, res) => {
  const { name, email, date, time, reason } = req.body;

  if (!name || !email || !date || !time || !reason) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    const appointment = new Appointment({ name, email, date, time, reason });
    await appointment.save();
    res.json({ message: "Success", appointment });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: "Could not save appointment." });
  }
});

// Endpoint to retrieve all booked appointments from MongoDB
app.get("/api/appointments", async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: "Could not fetch appointments." });
  }
});


// MODULE: Server Initialization
const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`✅ Academic Advisor Server active on port ${PORT}`);
  });
}

module.exports = app;

