const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const ChatMessage = require("./models/ChatMessage");

// Routes
const userRoutes = require("./routes/user");
const productRoutes = require("./routes/product");
const scheduleRoutes = require("./routes/schedule");

require("dotenv").config();

const app = express();
const server = http.createServer(app); // wrap express in http server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // your React app
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect(process.env.MONGODB_STRING);
mongoose.connection.once("open", () => console.log("Now connected to MongoDB Atlas."));

// Routes
app.use("/users", userRoutes);
app.use("/product", productRoutes);
app.use("/schedule", scheduleRoutes);

// Socket.IO events
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Send chat history on connection
  ChatMessage.find().sort({ timestamp: 1 }).limit(50).then(messages => {
    socket.emit("chatHistory", messages);
  });

  // Listen for new messages
  socket.on("sendMessage", async (data) => {
    const newMessage = new ChatMessage(data);
    await newMessage.save();

    // Broadcast to all users
    io.emit("receiveMessage", newMessage);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`API is now online on port ${PORT}`);
});
