const express = require("express");
const router = express.Router();
const axios = require("axios");
const Feed = require("../models/Feed");
const authMiddleware = require("../middleware/auth");

// Sabhi routes pe auth lagao
router.use(authMiddleware);

// ─── POST /api/feed/add ───────────────────────────────────────────────────────
// Naya text add karo — Django se analyse karwao — MongoDB mein save karo
router.post("/add", async (req, res) => {
  try {
    const { text, source = "manual" } = req.body;

    if (!text || text.trim().length < 3) {
      return res
        .status(400)
        .json({ error: "Text kam se kam 3 characters ka hona chahiye." });
    }

    // Step 1: MongoDB mein pending status ke saath save karo
    const feed = new Feed({
      userId: req.user.user_id || req.user.id,
      text: text.trim(),
      source,
      status: "pending",
    });
    await feed.save();

    // Step 2: Django API se sentiment analyse karo
    try {
      const djangoResponse = await axios.post(
        `${process.env.DJANGO_API_URL}/sentiment/analyse/`,
        { text: text.trim() },
        {
          headers: {
            Authorization: req.headers.authorization, // same token pass karo
            "Content-Type": "application/json",
          },
          timeout: 30000, // 30 seconds timeout
        },
      );

      const result = djangoResponse.data.result;

      // Step 3: Result MongoDB mein update karo
      feed.sentiment = {
        label: result.sentiment_label,
        score: result.sentiment_score,
        all_scores: result.sentiment_all_scores,
      };
      feed.emotion = {
        dominant: result.dominant_emotion,
        score: result.emotion_score,
        all_emotions: result.all_emotions,
      };
      feed.status = "analysed";
      await feed.save();
    } catch (djangoError) {
      // Django fail ho toh bhi feed save karo — sirf status change karo
      feed.status = "failed";
      await feed.save();
    }

    res.status(201).json({
      message: "Feed added successfully!",
      feed,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── GET /api/feed ────────────────────────────────────────────────────────────
// User ki saari feeds lo
router.get("/", async (req, res) => {
  try {
    const userId = req.user.user_id || req.user.id;
    const feeds = await Feed.find({ userId }).sort({ createdAt: -1 }).limit(50);

    res.json({
      count: feeds.length,
      feeds,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── GET /api/feed/stats ──────────────────────────────────────────────────────
// Sentiment stats — dashboard ke liye
router.get("/stats", async (req, res) => {
  try {
    const userId = req.user.user_id || req.user.id;

    const feeds = await Feed.find({ userId, status: "analysed" });

    // Count karo
    const stats = {
      total: feeds.length,
      sentiment: { positive: 0, negative: 0, neutral: 0 },
      emotions: {},
    };

    feeds.forEach((feed) => {
      // Sentiment count
      if (feed.sentiment?.label) {
        stats.sentiment[feed.sentiment.label]++;
      }
      // Emotion count
      if (feed.emotion?.dominant) {
        const em = feed.emotion.dominant;
        stats.emotions[em] = (stats.emotions[em] || 0) + 1;
      }
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── DELETE /api/feed/:id ─────────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const userId = req.user.user_id || req.user.id;
    await Feed.findOneAndDelete({ _id: req.params.id, userId });
    res.json({ message: "Feed deleted." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
