const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");

// ✅ Load environment variables first
dotenv.config();

const app = express();
// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// ✅ Serve static frontend files
app.use(express.static(path.join(__dirname, "public")));

// ✅ Routes
const authRoutes = require("./routes/auth");
const laundryRoutes = require("./routes/laundryRoutes");
const complaintRoutes = require("./routes/complaintRoutes");

// ✅ Config
const MONGODB_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 2000;
const JWT_SECRET=process.env.JWT_SECRET;

if (!MONGODB_URI) {
  console.error("❌ ERROR: MONGO_URI not found in .env file!");
  process.exit(1);
}
if (!JWT_SECRET) {
  console.error("❌ ERROR: JWT_SECRET not found in .env file!");
  process.exit(1);
}
// ✅ Connect to MongoDB
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected successfully."))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });
// ✅ Route setup
app.use("/auth", authRoutes); // for login/register routes
app.use("/laundry", laundryRoutes); 
app.use("/complaints", complaintRoutes);
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "landing.html"));
});

// ✅ Handle 404 for unknown API routes
app.use((req, res, next) => {
  if (req.path.startsWith("/api") ||
   req.path.startsWith("/laundry") ||
    req.path.startsWith("/auth")) {
    return res.status(404).json({ message: "Route not found" });
  }
  next();
});



// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on: http://localhost:${PORT}`);
});
