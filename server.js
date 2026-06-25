require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const extractIp = require("./middleware/extractIp");
const bookingRoutes = require("./routes/bookings");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = 5000;

// ── Connect MongoDB ─────────────────────────────────────────
connectDB();

// ── Global Middleware ───────────────────────────────────────
app.use(
  cors({ origin: "*", methods: ["GET", "POST", "PUT", "PATCH", "DELETE"] }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(extractIp);

// ── Serve frontend from /public ─────────────────────────────
// Put your workshop.html here as index.html, then open:
// http://localhost:5000  (NOT Live Server's :5500)
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "workshop.html"));
});
// ── IP endpoint ─────────────────────────────────────────────
app.get("/api/ip", (req, res) => {
  console.log("react server");
  res.json({ success: true, ip: req.clientIp });
});

// ── Booking Routes ──────────────────────────────────────────
app.use("/api/bookings", bookingRoutes);

// ── Health check ────────────────────────────────────────────
app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "🔧 AutoFix Workshop Booking API",
    database: "bookingsystem",
    yourIp: req.clientIp,
    endpoints: {
      myBookings: "GET    /api/bookings/mine",
      allBookings: "GET    /api/bookings",
      create: "POST   /api/bookings",
      updateStatus: "PATCH  /api/bookings/:id/status",
      delete: "DELETE /api/bookings/:id",
      stats: "GET    /api/bookings/stats/summary",
    },
  });
});

// ── SPA fallback ────────────────────────────────────────────
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ── Error handler ───────────────────────────────────────────
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n🚀  Server:   http://localhost:${PORT}`);
  console.log(`📡  API:      http://localhost:${PORT}/api`);
  console.log(`🗄️   Database: bookingsystem (MongoDB)\n`);
});
