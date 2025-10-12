// Index.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const ChatMessage = require("./models/ChatMessage");
require("dotenv").config();

// Routes
const userRoutes = require("./routes/user");
const productRoutes = require("./routes/product");
const scheduleRoutes = require("./routes/schedule");
const quotesRoutes = require("./routes/quotes");

const app = express();
const server = http.createServer(app);

// ✅ Allowed origins (local + your deployed frontends)
const allowedOrigins = [
  "http://localhost:3000",
  "https://paluwagan-app.vercel.app",
  "https://paluwagan-app-git-master-john-kenneths-projects.vercel.app",
  "https://paluwagan-2w9n6rmt9-john-kenneths-projects.vercel.app",
];

// ✅ Express CORS middleware
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());

// ✅ Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

// ✅ MongoDB connection
mongoose
  .connect(process.env.MONGODB_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

// ✅ Routes
app.use("/users", userRoutes);
app.use("/product", productRoutes);
app.use("/schedule", scheduleRoutes);
app.use("/quotes", quotesRoutes);

// ✅ Socket.IO JWT Authentication
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  console.log("🔑 Token received:", token);

  if (!token) {
    return next(new Error("Authentication error: No token provided"));
  }

  try {
    const decoded = jwt.verify(token, process.env.AUTH_SECRET_KEY);
    console.log("✅ Decoded token:", decoded);

    socket.user = {
      _id: decoded._id,
      codename: decoded.codename,
    };
    next();
  } catch (err) {
    console.error("❌ Token verification error:", err);
    return next(new Error("Authentication error: Invalid token"));
  }
});

// ✅ Socket.IO Events
io.on("connection", async (socket) => {
  console.log("🟢 User connected:", socket.id, "->", socket.user.codename);

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
    console.log("📩 Received message:", data);
    console.log("User from socket:", socket.user);

    try {
      const newMessage = new ChatMessage({
        user: socket.user._id,
        message: data.message,
        timestamp: data.timestamp || new Date(),
      });

      await newMessage.save();
      console.log("✅ Message saved successfully");

      const populatedMessage = await ChatMessage.findById(newMessage._id).populate(
        "user",
        "codename _id"
      );

      io.emit("receiveMessage", populatedMessage);
    } catch (err) {
      console.error("❌ Error saving message:", err);
      if (err.name === "ValidationError") {
        console.error("Validation errors:", err.errors);
      }
    }
  });

  // Typing indicators
  socket.on("userTyping", (codename) => {
    socket.broadcast.emit("userTyping", codename);
  });

  socket.on("stopTyping", () => {
    socket.broadcast.emit("stopTyping");
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});

// ✅ Start server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 API is now online on port ${PORT}`);
});
