// Dependencies and Modules
const express = require("express");
const mongoose = require("mongoose");

const cors = require("cors");

// Routes
const userRoutes = require("./routes/user");

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
  origin: [
    'http://localhost:3000'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.options('/', cors(corsOptions));
app.get("/test", (req, res) => {
  res.json({ message: "CORS test passed" });
});

//MongoDB Connection
mongoose.connect(process.env.MONGODB_STRING);
mongoose.connection.once('open', () => console.log("Now connected to MongoDB Atlas."));

// Backend Routes
app.use("/users", userRoutes);

if (require.main === module) {
  app.listen(process.env.PORT || 3000, () => {
    console.log(`API is now online on port ${process.env.PORT || 3000}`)
  });
}

module.exports = { app, mongoose };