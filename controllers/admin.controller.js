const Chat = require("../models/Chat");

exports.getAllChats = async (req, res) => {
  try {
    const chats = await Chat.find().sort({ updatedAt: -1 });
    res.json(chats);
  } catch (err) { res.status(500).json({ error: "Fetch Error" }); }
};
