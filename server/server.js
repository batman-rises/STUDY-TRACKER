const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const studyRoutes = require("./routes/studyRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

const app = express();

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is missing from environment variables.");
}

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json({ limit: "20kb" }));

// Public routes: users need these before logging in.
app.use("/api/auth", authRoutes);

// Protected routes: middleware inside these routers checks JWT.
app.use("/api/study", studyRoutes);
app.use("/api/analytics", analyticsRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Study Tracker API is running",
  });
});

// Connect to MongoDB before accepting requests.
const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
