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
  const SYSTEM_PROMPT = `You are an AI-powered Student Academic Advisor. 
Use this Stream-Course Knowledge Base:
${kbString}

RULES:
1. VALIDATION: If the user's message is irrelevant, ask them to clarify regarding academics/careers.
2. Ensure stream selection (Science, Commerce, Arts) is prioritized.
3. Provide career guidance based on the knowledge base.
4. Manage appointment booking conversationally.
5. Provide navigation chips using the format [SUGGESTED]: Topic.

Greet the student by name and guide them through their academic journey.`;

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

