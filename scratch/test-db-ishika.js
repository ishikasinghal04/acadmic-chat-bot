require("dotenv").config();
const mongoose = require("mongoose");

async function testConnection() {
  const uri = "mongodb+srv://ishikasinghal04:kaif8057@ac-q7ymtvy.xoruwrt.mongodb.net/acadbot?retryWrites=true&w=majority";
  console.log("Testing connection with username 'ishikasinghal04' to:", uri.replace(/:[^:@]+@/, ":****@"));
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
