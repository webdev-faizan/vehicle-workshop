const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");

// ═══════════════════════════════════════════════════════════
//  GET  /api/ip
//  Returns the client's IP address
// ═══════════════════════════════════════════════════════════
router.get("/ip", (req, res) => {
  res.json({ success: true, ip: req.clientIp });
});

// ═══════════════════════════════════════════════════════════
//  GET  /api/bookings/all
//  Returns ALL bookings in the system (admin view)
//  Query params: ?status=  ?search=  ?date=  ?page=  ?limit=
// ═══════════════════════════════════════════════════════════
router.get("/all", async (req, res, next) => {
  try {
    const { status, search, date, page = 1, limit = 100 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (date) filter["slot.date"] = date;
    if (search) {
      const re = new RegExp(search, "i");
      filter.$or = [
        { "customer.name": re },
        { "customer.location": re },
        { "vehicle.plate": re },
        { "vehicle.make": re },
        { "vehicle.model": re },
        { "service.name": re },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Booking.countDocuments(filter);
    const bookings = await Booking.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: bookings,
    });
  } catch (err) {
    next(err);
  }
});

// ═══════════════════════════════════════════════════════════
//  GET  /api/bookings/mine
//  Returns bookings belonging to the current user (by IP)
//  Query params: ?status=  ?search=  ?date=  ?page=  ?limit=
// ═══════════════════════════════════════════════════════════
router.get("/mine", async (req, res, next) => {
  try {
    const { status, search, date, page = 1, limit = 50 } = req.query;
    const filter = { userIp: req.clientIp };

    if (status) filter.status = status;
    if (date) filter["slot.date"] = date;
    if (search) {
      const re = new RegExp(search, "i");
      filter.$or = [
        { "customer.name": re },
        { "customer.location": re },
        { "vehicle.plate": re },
        { "vehicle.make": re },
        { "vehicle.model": re },
        { "service.name": re },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Booking.countDocuments(filter);
    const bookings = await Booking.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      ip: req.clientIp,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: bookings,
    });
  } catch (err) {
    next(err);
  }
});

// ═══════════════════════════════════════════════════════════
//  GET  /api/bookings/stats/summary
//  Returns count of bookings by status
// ═══════════════════════════════════════════════════════════
router.get("/stats/summary", async (req, res, next) => {
  try {
    const stats = await Booking.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const summary = {
      Pending: 0,
      Confirmed: 0,
      Done: 0,
      Cancelled: 0,
      total: 0,
    };
    stats.forEach((s) => {
      summary[s._id] = s.count;
      summary.total += s.count;
    });
    res.json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
});

// ═══════════════════════════════════════════════════════════
//  POST  /api/bookings
//  Create a new booking
//  Body: { vehicle, service, slot, customer }
// ═══════════════════════════════════════════════════════════
router.post("/", async (req, res, next) => {
  try {
    const payload = { ...req.body, userIp: req.clientIp };
    const booking = await Booking.create(payload);
    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
});

// ═══════════════════════════════════════════════════════════
//  GET  /api/bookings
//  Returns bookings with optional filters (general view)
//  Query params: ?status=  ?search=  ?date=  ?page=  ?limit=
// ═══════════════════════════════════════════════════════════
router.get("/", async (req, res, next) => {
  try {
    const { status, search, date, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (date) filter["slot.date"] = date;
    if (search) {
      const re = new RegExp(search, "i");
      filter.$or = [
        { "customer.name": re },
        { "customer.location": re },
        { "vehicle.plate": re },
        { "vehicle.make": re },
        { "vehicle.model": re },
        { "service.name": re },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Booking.countDocuments(filter);
    const bookings = await Booking.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: bookings,
    });
  } catch (err) {
    next(err);
  }
});

// ═══════════════════════════════════════════════════════════
//  GET  /api/bookings/:id
//  Get a single booking by ID
// ═══════════════════════════════════════════════════════════
router.get("/:id", async (req, res, next) => {
  try {
    // Validate MongoDB ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: "Invalid booking ID format",
      });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: "Booking not found",
      });
    }
    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
});

// ═══════════════════════════════════════════════════════════
//  PATCH  /api/bookings/:id/status
//  Update booking status and/or workshop note
//  Body: { status, workshopNote }
// ═══════════════════════════════════════════════════════════
router.patch("/:id/status", async (req, res, next) => {
  try {
    const { status, workshopNote } = req.body;
    const allowed = ["Pending", "Confirmed", "Done", "Cancelled"];

    if (status && !allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Status must be one of: ${allowed.join(", ")}`,
      });
    }

    const update = {};
    if (status !== undefined) update.status = status;
    if (workshopNote !== undefined) update.workshopNote = workshopNote;

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true, runValidators: true },
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: "Booking not found",
      });
    }
    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
});

// ═══════════════════════════════════════════════════════════
//  DELETE  /api/bookings/:id
//  Delete a booking (owner-only by IP check)
// ═══════════════════════════════════════════════════════════
router.delete("/:id", async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: "Booking not found",
      });
    }

    // Security: Only allow deletion if the booking belongs to this user
    if (booking.userIp !== req.clientIp) {
      return res.status(403).json({
        success: false,
        error: "Not authorised to delete this booking",
      });
    }

    await booking.deleteOne();
    res.json({ success: true, message: "Booking deleted successfully" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
