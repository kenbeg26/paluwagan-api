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
// MongoDB connection with better error handling
mongoose.connect(process.env.MONGODB_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("Connected to MongoDB Atlas"))
.catch(err => console.error("MongoDB connection error:", err));

mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

// Routes
app.use("/users", userRoutes);
app.use("/product", productRoutes);
app.use("/schedule", scheduleRoutes);

// ✅ Socket.IO with JWT auth
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  console.log("Token received:", token); // Debug log
  
  if (!token) {
    return next(new Error("Authentication error: No token provided"));
  }

  try {
    const decoded = jwt.verify(token, process.env.AUTH_SECRET_KEY);
    console.log("Decoded token:", decoded); // Debug log
    socket.user = decoded;
    next();
  } catch (err) {
    console.error("Token verification error:", err);
    return next(new Error("Authentication error: Invalid token"));
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
    socket.emit("error", { message: "Failed to load chat history" });
  }

  // Listen for new messages
  socket.on("sendMessage", async (data) => {
  console.log("Received message:", data);
  console.log("User from socket:", socket.user);
  
  try {
    const newMessage = new ChatMessage({
      user: socket.user._id,
      message: data.message,
    });

    console.log("Message to save:", newMessage);
    
    await newMessage.save();
    console.log("Message saved successfully");

    const populatedMessage = await newMessage.populate("user", "codename");
    console.log("Populated message:", populatedMessage);
    
    io.emit("receiveMessage", populatedMessage);
  } catch (err) {
    console.error("Error saving message:", err);
    // Log specific error details
    if (err.name === 'ValidationError') {
      console.error("Validation errors:", err.errors);
    }
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
