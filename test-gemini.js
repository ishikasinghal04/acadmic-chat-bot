require("dotenv").config();

async function testGemini() {
  console.log("🔍 Testing Gemini 2.0 Flash (Unified Engine)...\n");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: "hi" }] }]
      })
    });

    const data = await res.json();
    
    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.log("✅ Gemini API: ONLINE");
      console.log("💬 Response: " + data.candidates[0].content.parts[0].text);
    } else {
      console.log("❌ Gemini API: FAILED");
      console.log("   Details: " + JSON.stringify(data, null, 2));
    }
  } catch (e) {
    console.log("❌ Network Error: " + e.message);
  }
}

testGemini();
