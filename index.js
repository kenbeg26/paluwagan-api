// Index.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const ChatMessage = require("./models/ChatMessage");

// Routes
const userRoutes = require("./routes/user");
const productRoutes = require("./routes/product");
const scheduleRoutes = require("./routes/schedule");

require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect(process.env.MONGODB_STRING);
mongoose.connection.once("open", () =>
  console.log("Now connected to MongoDB Atlas.")
);

// Routes
app.use("/users", userRoutes);
app.use("/product", productRoutes);
app.use("/schedule", scheduleRoutes);

// ✅ Socket.IO with JWT auth
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("Authentication error: No token"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded; // e.g., { _id, codename }
    next();
  } catch (err) {
    console.error("JWT verification failed:", err);
    next(new Error("Authentication error: Invalid token"));
  }
});

io.on("connection", async (socket) => {
  console.log("User connected:", socket.id, "->", socket.user.codename);

  // Send chat history
  try {
    const messages = await ChatMessage.find()
      .populate("user", "codename")
      .sort({ timestamp: 1 })
      .limit(50);

    socket.emit("chatHistory", messages);
  } catch (err) {
    console.error("Error fetching chat history:", err);
  }

  // Listen for new messages
  socket.on("sendMessage", async (data) => {
    try {
      const newMessage = new ChatMessage({
        user: socket.user._id, // ✅ from JWT
        message: data.message,
      });

      await newMessage.save();

      const populatedMessage = await newMessage.populate("user", "codename");
      io.emit("receiveMessage", populatedMessage);
    } catch (err) {
      console.error("Error saving message:", err);
    }
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
