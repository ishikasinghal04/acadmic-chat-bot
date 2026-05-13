const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  studentId: { type: String, required: true },
  phone: { type: String, required: true },
  department: { type: String, required: true },
  year: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  reason: { type: String },
  status: { type: String, default: "Pending" },
  meetingLink: { type: String, default: "" } // NEW: Google Meet Link
}, { timestamps: true });

module.exports = mongoose.model("Appointment", appointmentSchema);
