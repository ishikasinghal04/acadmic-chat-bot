const Appointment = require("../models/Appointment");

exports.bookAppointment = async (req, res) => {
  const { name, email, phone, department, year, date, time, reason, studentId } = req.body;
  try {
    const existing = await Appointment.findOne({ date, time });
    if (existing) return res.status(400).json({ error: "Slot already booked!" });
    
    const appt = new Appointment({ 
      name, email, phone, department, year, studentId, date, time, reason, 
      status: "Pending",
      meetingLink: ""
    });
    await appt.save();
    res.json({ message: "Success", appointment: appt });
  } catch (err) { res.status(500).json({ error: "DB Error" }); }
};

exports.getAppointments = async (req, res) => {
  try {
    const { studentId } = req.query;
    // If studentId provided, filter by it (for student view)
    const filter = studentId ? { studentId } : {};
    const list = await Appointment.find(filter).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) { res.status(500).json({ error: "Fetch Error" }); }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status, meetingLink } = req.body;
    const updateData = { status };
    if (meetingLink !== undefined) updateData.meetingLink = meetingLink;

    const appt = await Appointment.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(appt);
  } catch (err) { res.status(500).json({ error: "Update Error" }); }
};

exports.deleteAppointment = async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ error: "Delete Error" }); }
};
