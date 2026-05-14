require("dotenv").config();
const mongoose = require("mongoose");

async function testConnection() {
  const uri = (process.env.MONGODB_URI || "").trim();
  console.log("Testing connection to:", uri);
  try {
    await mongoose.connect(uri);
    console.log("✅ Successfully connected to MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("❌ Connection failed:", error.message);
    process.exit(1);
  }
}

testConnection();
