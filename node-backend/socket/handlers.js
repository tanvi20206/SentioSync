const Feed = require("../models/Feed");

// Mock social media posts — real-time feed simulate karne ke liye
const MOCK_POSTS = [
  "I absolutely love this new feature! Amazing work!",
  "This is so frustrating, nothing works properly.",
  "Just another day, nothing special going on.",
  "I'm so excited about the upcoming release!",
  "Terrible experience, I want my money back.",
  "The weather is nice today, feeling calm.",
  "This product changed my life for the better!",
  "I hate waiting so long for customer support.",
  "Feeling neutral about the whole situation.",
  "Wow, I'm shocked at how good this turned out!",
  "I'm scared about what might happen next.",
  "Best purchase I've ever made, highly recommend!",
];

let mockFeedInterval = null;

const setupSocketHandlers = (io) => {
  io.on("connection", (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    // ─── User apna room join kare ─────────────────────────────────────────
    socket.on("join_room", (userId) => {
      socket.join(`user_${userId}`);
      console.log(`👤 User ${userId} joined their room`);
      socket.emit("joined", { message: `Joined room for user ${userId}` });
    });

    // ─── Mock feed start karo ─────────────────────────────────────────────
    // Har 3 second mein ek random post aayega — live feed simulate
    socket.on("start_mock_feed", (userId) => {
      console.log(`▶️ Mock feed started for user ${userId}`);

      // Pehle clear karo agar chal raha ho
      if (mockFeedInterval) clearInterval(mockFeedInterval);

      mockFeedInterval = setInterval(async () => {
        // Random post lo
        const randomPost =
          MOCK_POSTS[Math.floor(Math.random() * MOCK_POSTS.length)];

        // Sirf emit karo — analysis Angular side pe dikhayenge
        io.to(`user_${userId}`).emit("new_feed_item", {
          text: randomPost,
          timestamp: new Date().toISOString(),
          source: "mock_feed",
        });
      }, 3000); // har 3 second mein
    });

    // ─── Mock feed band karo ──────────────────────────────────────────────
    socket.on("stop_mock_feed", () => {
      if (mockFeedInterval) {
        clearInterval(mockFeedInterval);
        mockFeedInterval = null;
        console.log("⏹️ Mock feed stopped");
      }
      socket.emit("feed_stopped", { message: "Mock feed stopped." });
    });

    // ─── Manual text ka real-time result broadcast karo ──────────────────
    socket.on("analysis_complete", (data) => {
      // Jab Angular se analysis result aaye, sab users ko broadcast karo
      const { userId, result } = data;
      io.to(`user_${userId}`).emit("sentiment_update", result);
    });

    // ─── Disconnect ───────────────────────────────────────────────────────
    socket.on("disconnect", () => {
      console.log(`❌ User disconnected: ${socket.id}`);
      if (mockFeedInterval) {
        clearInterval(mockFeedInterval);
        mockFeedInterval = null;
      }
    });
  });
};

module.exports = setupSocketHandlers;
