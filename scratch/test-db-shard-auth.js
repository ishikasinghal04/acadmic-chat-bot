require("dotenv").config();
const mongoose = require("mongoose");

async function testConnection() {
  const uri = "mongodb://corewithkaif:kaif8057@ac-q7ymtvy-shard-00-01.xoruwrt.mongodb.net:27017/acadbot?authSource=admin&retryWrites=true&w=majority";
  console.log("Testing direct connection to shard node with authSource=admin...");
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log("✅ Successfully connected to MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("❌ Connection failed:", error.message);
    process.exit(1);
  }
}

testConnection();
