const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log("♻️ Using existing MongoDB connection");
    return;
  }

  try {
    const uri = (process.env.MONGODB_URI || "").trim();
    if (!uri) {
      console.warn("⚠️ MONGODB_URI is empty.");
      return;
    }

    console.log("📡 Connecting to MongoDB...");
    const db = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    
    isConnected = db.connections[0].readyState;
    console.log("🌱 MongoDB Connected Successfully!");
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
  }
};

module.exports = connectDB;
