const express = require("express");
const router = express.Router();
const apptController = require("../controllers/appointment.controller");

router.post("/", apptController.bookAppointment);
router.get("/", apptController.getAppointments);
router.put("/:id/status", apptController.updateStatus); // NEW
router.delete("/:id", apptController.deleteAppointment);

module.exports = router;
