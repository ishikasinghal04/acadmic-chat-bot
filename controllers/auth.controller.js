const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res) => {
  const { name, email, password, studentId } = req.body;
  try {
    const existing = await User.findOne({ $or: [{ email }, { studentId }] });
    if (existing) return res.status(400).json({ error: "User already exists!" });

    const user = new User({ name, email, password, studentId });
    await user.save();
    res.json({ message: "Account created successfully!" });
  } catch (err) { res.status(500).json({ error: "Signup Failed: " + err.message }); }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found!" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid password!" });

    const token = jwt.sign({ id: user._id, studentId: user.studentId }, "SECRET_KEY", { expiresIn: "1d" });
    res.json({ token, studentId: user.studentId, name: user.name });
  } catch (err) { res.status(500).json({ error: "Login Failed" }); }
};
