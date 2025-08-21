// Dependencies and Modules
const express = require('express');
const scheduleController = require('../controllers/schedule');
const { verify, verifyAdmin } = require("../auth");

// Routing Component
const router = express.Router();

//router.get("/get-schedule", verify, scheduleController.getSchedule);

router.post("/pick-schedule", verify, scheduleController.pickSchedule);

module.exports = router;