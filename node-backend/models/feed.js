const mongoose = require("mongoose");

// Har ek social media post/message ka schema
const FeedSchema = new mongoose.Schema({
  // Kis user ka feed hai
  userId: {
    type: String,
    required: true,
    index: true, // fast search ke liye
  },

  // Original text (post/comment/message)
  text: {
    type: String,
    required: true,
    maxlength: 5000,
  },

  // Source — kahan se aaya (mock, manual, csv)
  source: {
    type: String,
    enum: ["manual", "mock_feed", "csv_upload"],
    default: "manual",
  },

  // Sentiment result (Django se aayega)
  sentiment: {
    label: { type: String, enum: ["positive", "negative", "neutral"] },
    score: { type: Number },
    all_scores: { type: Object },
  },

  // Emotion result (Django se aayega)
  emotion: {
    dominant: { type: String },
    score: { type: Number },
    all_emotions: { type: Object },
  },

  // Status — analysis hua ya pending hai
  status: {
    type: String,
    enum: ["pending", "analysed", "failed"],
    default: "pending",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Feed", FeedSchema);
