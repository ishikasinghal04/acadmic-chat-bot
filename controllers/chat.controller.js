const Chat = require("../models/Chat");
const mongoose = require("mongoose");

/**
 * GEMINI-POWERED CHAT CONTROLLER
 * Optimized for Gemini Flash Latest (Verified Key)
 */
exports.handleChat = async (req, res) => {
  const { message, studentId, sessionId } = req.body;
  
  try {
    const isDBConnected = mongoose.connection.readyState === 1;
    let chatSession = null;

    if (isDBConnected && sessionId && sessionId !== 'null') {
      chatSession = await Chat.findById(sessionId).catch(() => null);
    }

    const historyContext = (chatSession?.messages || []).slice(-4).map(m => `${m.role}: ${m.content}`).join("\n");

    // 🚀 USING GEMINI FLASH LATEST (As per User's Verified Curl)
    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [{ text: `You are AcadBot. Context:\n${historyContext}\n\nUser Question: ${message}` }]
        }]
      })
    });

    const data = await geminiRes.json();
    const botResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "I am currently syncing. Please try again in 10 seconds.";

    if (isDBConnected) {
      if (!chatSession) chatSession = new Chat({ userName: studentId || "User", title: message.substring(0, 30) + "..." });
      chatSession.messages.push({ role: "user", content: message }, { role: "assistant", content: botResponse });
      await chatSession.save().catch(e => console.error("DB Save Fail:", e.message));
    }

    res.json({ response: botResponse, sessionId: chatSession?._id || "offline-session" });

  } catch (err) {
    res.status(500).json({ error: "Academic module temporarily offline." });
  }
};

exports.getSessions = async (req, res) => {
  if (mongoose.connection.readyState !== 1) return res.json([]);
  const sessions = await Chat.find({ userName: req.query.studentId }).sort({ updatedAt: -1 }).select("title");
  res.json(sessions);
};

exports.getSessionMessages = async (req, res) => {
  if (mongoose.connection.readyState !== 1) return res.json([]);
  const chat = await Chat.findById(req.params.id).catch(() => null);
  res.json(chat ? chat.messages : []);
};

exports.deleteSession = async (req, res) => {
  if (mongoose.connection.readyState !== 1) return res.status(503).json({ error: "DB Offline" });
  await Chat.findByIdAndDelete(req.params.id).catch(() => null);
  res.json({ message: "Deleted" });
};
