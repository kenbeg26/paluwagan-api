const express = require('express');
const productController = require('../controllers/product');

const { verify, verifyAdmin } = require("../auth");

// Routing Component
const router = express.Router();


module.exports = router;