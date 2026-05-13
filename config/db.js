const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri = (process.env.MONGODB_URI || "").trim();
    if (!uri) {
      console.warn("⚠️ MONGODB_URI is empty.");
      return;
    }

    console.log("📡 Connecting to MongoDB...");
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("🌱 MongoDB Connected Successfully!");
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
  }
};

module.exports = connectDB;
