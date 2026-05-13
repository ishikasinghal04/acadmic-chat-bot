const Chat = require("../models/Chat");

exports.getTrends = async (req, res) => {
  try {
    const stats = await Chat.aggregate([
      { $unwind: "$messages" },
      { $group: { _id: "$messages.category", count: { $sum: 1 } } }
    ]);
    const priorityCount = await Chat.countDocuments({ "messages.isHighPriority": true });
    res.json({ stats, priorityCount });
  } catch (err) {
    res.status(500).json({ error: "Analytics failed" });
  }
};
