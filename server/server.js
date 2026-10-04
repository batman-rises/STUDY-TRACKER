const express = require("express");
const cors = require("cors");
require("dotenv").config();

const studyRoutes = require("./routes/studyRoutes.js");

const connectDB = require("./config/db.js");

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/study", studyRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Study Tracker API is running",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
