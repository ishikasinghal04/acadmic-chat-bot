const Chat = require("../models/Chat");
const Stream = require("../models/Stream");

exports.handleChat = async (req, res) => {
  const { message, history, studentId } = req.body;

  // 1. Sentiment Detection & Priority Flagging
  const sensitiveKeywords = ["fail", "stress", "tension", "burnout", "dropout", "depressed"];
  const isHighPriority = sensitiveKeywords.some(word => message.toLowerCase().includes(word));
  
  // 2. Dynamic KB Fetch from MongoDB
  const streams = await Stream.find();
  const kbString = streams
    .map(s => `${s.name} Paths: ${s.paths.map(p => `${p.title} (${p.courses.join(", ")})`).join("; ")}`)
    .join("\n");

  // 3. Categorization for Analytics
  let category = "GENERAL_QUERY";
  const lowerMsg = message.toLowerCase();
  if (lowerMsg.includes("course") || lowerMsg.includes("stream")) category = "COURSE_QUERY";
  if (lowerMsg.includes("placement") || lowerMsg.includes("career")) category = "CAREER_QUERY";
  if (isHighPriority) category = "EMOTIONAL_SUPPORT";

  const SYSTEM_PROMPT = `You are AcadBot. Mission: Support & Guidance.
  CONTEXT: ${kbString}
  GATEKEEPER: If stress/fail is detected, show Empathy FIRST.
  LOGGING: End with [LOG: CATEGORY] (CAREER, SCHOLARSHIP, etc).
  APPOINTMENTS: 1hr slots (Mon 10AM, Wed 2PM, Fri 11AM).
  TONE: Multilingual Hinglish, Bold tags, proactive follow-up.`;

  const contents = (history || []).map(msg => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }]
  }));
  contents.push({ role: "user", parts: [{ text: message }] });

  try {
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
    res.status(500).json({ error: "AI Engine Offline" });
  }
};
