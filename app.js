const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// ✅ Load environment variables first
dotenv.config();

const app = express();

// ✅ Routes
const authRoutes = require("./routes/auth");
const laundryRoutes = require("./routes/laundryRoutes");

// ✅ Config
const MONGODB_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 2000;

if (!MONGODB_URI) {
  console.error("❌ ERROR: MONGO_URI not found in .env file!");
  process.exit(1);
}

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve static frontend files
app.use(express.static(path.join(__dirname, "public")));

// ✅ Route setup
app.use("/auth", authRoutes); // for login/register routes
app.use("/laundry", laundryRoutes); 
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "landing.html"));
});

// ✅ Handle 404 for unknown API routes
app.use((req, res, next) => {
  if (req.path.startsWith("/api") || req.path.startsWith("/laundry") || req.path.startsWith("/auth")) {
    return res.status(404).json({ message: "Route not found" });
  }
  next();
});

// ✅ Connect to MongoDB
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected successfully."))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on: http://localhost:${PORT}`);
});
