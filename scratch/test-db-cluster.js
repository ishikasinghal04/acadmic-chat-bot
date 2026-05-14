require("dotenv").config();
const mongoose = require("mongoose");

async function testConnection() {
  const uri = "mongodb+srv://corewithkaif:kaif8057@ac-q7ymtvy.xoruwrt.mongodb.net/acadbot?retryWrites=true&w=majority";
  console.log("Testing cluster connection to:", uri.replace(/:[^:@]+@/, ":****@"));
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
