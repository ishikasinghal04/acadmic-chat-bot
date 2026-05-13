const express = require("express");
const router = express.Router();
const apptController = require("../controllers/apptController");

router.post("/", apptController.bookAppointment);
router.get("/", apptController.getAppointments);

module.exports = router;
