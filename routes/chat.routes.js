const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat.controller");

router.post("/", chatController.handleChat);
router.get("/sessions", chatController.getSessions);
router.get("/session/:id", chatController.getSessionMessages);
router.delete("/session/:id", chatController.deleteSession);

module.exports = router;
