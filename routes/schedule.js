// Dependencies and Modules
const express = require('express');
const scheduleController = require('../controllers/schedule');
const { verify, verifyAdmin } = require("../auth");

// Routing Component
const router = express.Router();

router.get("/get-schedule", verify, scheduleController.getSchedule);

router.post("/pick-schedule", verify, scheduleController.pickSchedule);

router.get("/get-all-schedule", verify, scheduleController.getAllSchedule);

router.patch("/paid", verify, scheduleController.paidSchedule);

router.patch("/:scheduleId/update", verify, verifyAdmin, scheduleController.updateSchedule);

module.exports = router;