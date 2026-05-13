const mongoose = require("mongoose");
const Stream = require("./models/Stream");
const knowledgeBase = require("./knowledgeBase");
require("dotenv").config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/academic-advisor";

async function migrate() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB for Migration...");

    const streams = Object.entries(knowledgeBase.streams).map(([id, s]) => ({
      id,
      name: s.name,
      paths: s.paths
    }));

    await Stream.deleteMany({}); // Clear old data
    await Stream.insertMany(streams);

    console.log("✅ Knowledge Base Migrated to MongoDB Successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Migration Failed:", err);
    process.exit(1);
  }
}

migrate();
