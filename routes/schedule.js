// Dependencies and Modules
const express = require('express');
const scheduleController = require('../controllers/schedule');
const { verify, verifyAdmin } = require("../auth");

// Routing Component
const router = express.Router();

router.post('/checkout', verify, scheduleController.createSchedule);

//router.get('/my-schedule', verify, scheduleController.retrieveSchedule);

//router.get('/all-schedule', verify, verifyAdmin, scheduleController.retrieveAllSchedules);

module.exports = router;