const express = require('express');
const userController = require('../controllers/user');

const { verify, verifyAdmin } = require("../auth");

// Routing Component
const router = express.Router();

router.post("/register", userController.registerUser);

router.post("/login", userController.loginUser);

router.get("/details", verify, userController.getProfile);

router.patch("/:userId/set-user-active", verify, verifyAdmin, userController.setUserActive);




module.exports = router;