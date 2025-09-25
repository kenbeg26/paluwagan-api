// Dependencies and Modules
const bcrypt = require("bcrypt");
const User = require('../models/User');
const auth = require("../auth");
const { errorHandler } = auth;

//User Registration
module.exports.registerUser = (req, res) => {

  // Checks if the password has atleast 6 characters
  if (req.body.password.length < 6) {
    return res.status(400).send({ message: 'Password must be atleast 6 characters' });
    // If all needed requirements are achieved
  } else {
    let newUser = new User({
      name: req.body.name,
      codename: req.body.codename,
      password: bcrypt.hashSync(req.body.password, 10),
    })

    return newUser.save()
      .then((result) => res.status(201).send({
        message: 'Registered successfully'
      }))
      .catch(error => errorHandler(error, req, res));
  }
};

// Login User
module.exports.loginUser = (req, res) => {
  if (req.body.codename) {
    return User.findOne({ codename: req.body.codename })
      .then(result => {
        if (!result) {
          return res.status(404).json({ message: 'No User Found' });
        }

        const isPasswordCorrect = bcrypt.compareSync(req.body.password, result.password);
        if (isPasswordCorrect) {
          const token = auth.createAccessToken(result);

          // Ensure the token is inside `access` property
          return res.status(200).json({ access: token });
        } else {
          return res.status(401).json({ message: 'Codename and password do not match' });
        }
      })
      .catch(error => errorHandler(error, req, res));
  } else {
    return res.status(400).json({ message: 'Invalid codename' });
  }
};

// User details
module.exports.getProfile = async (req, res) => {
  try {
    console.log("Request user object:", req.user); // Debug log
    
    // Use req.user._id instead of req.user.id
    const userId = req.user._id; // JWT stores it as _id
    console.log("Looking for user ID:", userId);
    
    const user = await User.findById(userId).select("-password");

    if (!user) {
      console.log("User not found for ID:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("User found:", user.codename);
    return res.status(200).json({ user });
  } catch (error) {
    console.error("Error in getProfile:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Set user as active
// Toggle user active status
module.exports.setUserActive = (req, res) => {
  User.findById(req.params.userId)
    .then(user => {
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Toggle isActive
      user.isActive = !user.isActive;

      return user.save();
    })
    .then(updatedUser => {
      res.status(200).json({
        success: true,
        message: updatedUser.isActive 
          ? "User activated successfully" 
          : "User deactivated successfully",
        user: updatedUser
      });
    })
    .catch(error => errorHandler(error, req, res));
};


// Retrieve all Users (Admin only)
module.exports.getAllUser = (req, res) => {
  User.find({})
    .then(users => {
      console.log("Users found:", users);
      res.status(200).json(users);
    })
    .catch(error => errorHandler(error, req, res));
};