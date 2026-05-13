const Appointment = require("../models/Appointment");

exports.bookAppointment = async (req, res) => {
  const { name, email, date, time, reason, studentId } = req.body;
  try {
    const existing = await Appointment.findOne({ date, time });
    if (existing) {
      return res.status(400).json({ error: "Slot already booked. Choose another time." });
    }
    const appt = new Appointment({ name, email, studentId, date, time, reason });
    await appt.save();
    res.json({ message: "Success", appointment: appt });
  } catch (err) {
    res.status(500).json({ error: "Database Error" });
  }
};

exports.getAppointments = async (req, res) => {
  try {
    const list = await Appointment.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: "Fetch Error" });
  }
};
