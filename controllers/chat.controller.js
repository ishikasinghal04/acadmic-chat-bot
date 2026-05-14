const Chat = require("../models/Chat");
const Usage = require("../models/Usage");
const mongoose = require("mongoose");

/**
 * GEMINI-POWERED CHAT CONTROLLER
 * Optimized for Gemini Flash Latest (Verified Key)
 */
async function callAI(message, historyContext, preferredProvider = "auto") {
  const providers = {
    groq: async () => {
      const res = await fetch("https://api.groq.com/openai/v1/responses", {
        method: "POST",
        headers: { "Authorization": `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "openai/gpt-oss-20b", input: `Context:\n${historyContext}\n\nUser Question: ${message}` })
      });
      const data = await res.json();
      const text = data.output?.find(o => o.type === "message")?.content?.[0]?.text;
      if (text) return { text, usage: { totalTokenCount: data.usage?.total_tokens || 0 }, provider: "Groq Reasoning" };
      throw new Error("Groq failed");
    },
    gemini: async () => {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: `You are AcadBot. Context:\n${historyContext}\n\nUser Question: ${message}` }] }] })
      });
      const data = await res.json();
      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        return { text: data.candidates[0].content.parts[0].text, usage: data.usageMetadata, provider: "Gemini 2.0 Flash" };
      }
      throw new Error("Gemini failed");
    },
    openrouter: async () => {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-001",
          messages: [{ role: "system", content: "You are AcadBot, a helpful academic advisor." }, { role: "user", content: `Context:\n${historyContext}\n\nUser Question: ${message}` }]
        })
      });
      const data = await res.json();
      if (data.choices?.[0]?.message?.content) {
        return { text: data.choices[0].message.content, usage: { totalTokenCount: data.usage?.total_tokens || 0 }, provider: "OpenRouter (Backup)" };
      }
      throw new Error("OpenRouter failed");
    }
  };

  // 1. Manual Selection Logic
  if (preferredProvider !== "auto" && providers[preferredProvider]) {
    try { return await providers[preferredProvider](); } 
    catch (e) { console.warn(`Manual ${preferredProvider} failed, falling back to auto.`); }
  }

  // 2. Auto-Failover Chain: Groq -> Gemini -> OpenRouter
  const chain = ["groq", "gemini", "openrouter"];
  for (const p of chain) {
    try { return await providers[p](); } 
    catch (e) { console.error(`${p} Fail:`, e.message); }
  }

  return { text: "I'm experiencing high traffic. Please try again in a moment.", usage: { totalTokenCount: 0 }, provider: "Offline" };
}

exports.handleChat = async (req, res) => {
  const { message, studentId, sessionId, provider = "auto" } = req.body;
  
  try {
    const isDBConnected = mongoose.connection.readyState === 1;
    let chatSession = null;

    if (isDBConnected && sessionId && sessionId !== 'null') {
      chatSession = await Chat.findById(sessionId).catch(() => null);
    }

    const historyContext = (chatSession?.messages || []).slice(-4).map(m => `${m.role}: ${m.content}`).join("\n");

    const result = await callAI(message, historyContext, provider);
    const botResponse = result.text;
    const usage = result.usage;
    const activeProvider = result.provider;
    let dailyCount = 0;

    if (isDBConnected) {
      // 📈 Track Daily Quota
      const today = new Date().toISOString().split('T')[0];
      const usageDoc = await Usage.findOneAndUpdate(
        { date: today },
        { $inc: { count: 1 } },
        { upsert: true, new: true }
      );
      dailyCount = usageDoc.count;

      if (!chatSession) chatSession = new Chat({ userName: studentId || "User", title: message.substring(0, 30) + "..." });
      chatSession.messages.push({ role: "user", content: message }, { role: "assistant", content: botResponse });
      await chatSession.save().catch(e => console.error("DB Save Fail:", e.message));
    }

    res.json({ 
      response: botResponse, 
      sessionId: chatSession?._id || "offline-session",
      usage: usage,
      quota: { current: dailyCount, limit: 50 },
      provider: activeProvider
    });

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
