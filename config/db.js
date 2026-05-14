const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri = (process.env.MONGODB_URI || "").trim();
    if (!uri) {
      console.warn("⚠️ MONGODB_URI is empty.");
      return;
    }

    console.log(`📡 Attempting connection as: ${uri.split("@")[0].split("//")[1].split(":")[0]}`);
    console.log("📡 Connecting to MongoDB...");
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });
    console.log("🌱 MongoDB Connected Successfully!");
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.log("💡 Tip: Check your MONGODB_URI and IP Whitelist in Atlas.");
  }
};

module.exports = connectDB;
