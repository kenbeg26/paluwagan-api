const express = require('express');
const quotesController = require('../controllers/quotes');

const { verify, verifyAdmin } = require("../auth");

// Routing Component
const router = express.Router();


router.get("/random", quotesController.random);

module.exports = router;