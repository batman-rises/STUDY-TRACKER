const mongoose = require("mongoose");

const studySessionSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    hours: {
      type: Number,
      required: true,
      min: 0,
    },
    subjects: {
      type: [String],
      required: true,
    },
    topics: {
      type: [String],
      required: true,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("StudySession", studySessionSchema);
