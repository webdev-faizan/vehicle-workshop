const mongoose = require("mongoose");

// Collection: bookings  |  Database: bookingsystem
const BookingSchema = new mongoose.Schema(
  {
    // ── User identity (IP-based) ─────────────────────────────
    userIp: {
      type: String,
      required: true,
      index: true,
    },

    // ── Vehicle ─────────────────────────────────────────────
    vehicle: {
      make: { type: String, required: [true, "Vehicle make is required"] },
      model: { type: String, required: [true, "Vehicle model is required"] },
      year: { type: Number },
      plate: {
        type: String,
        required: [true, "Plate is required"],
        uppercase: true,
        trim: true,
      },
      fuel: {
        type: String,
        enum: ["Petrol", "Diesel", "Electric", "Hybrid", "CNG", ""],
        default: "",
      },
      mileage: { type: Number },
    },

    // ── Service ─────────────────────────────────────────────
    service: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      icon: { type: String, default: "🔧" },
      price: { type: String },
      duration: { type: String },
    },

    // ── Slot ────────────────────────────────────────────────
    slot: {
      date: { type: String, required: [true, "Date is required"] },
      time: { type: String, required: [true, "Time is required"] },
    },

    // ── Customer ────────────────────────────────────────────
    customer: {
      name: { type: String, required: [true, "Name is required"] },
      phone: { type: String, required: [true, "Phone is required"] },
      notes: { type: String, default: "" },

      // ── Location (new) ───────────────────────────────────
      // Human-readable address the customer types in
      location: {
        type: String,
        required: [true, "Location / address is required"],
        trim: true,
      },
      // Optional precise coords (filled by browser Geolocation API)
      locationCoords: {
        lat: { type: Number, default: null },
        lng: { type: Number, default: null },
      },
    },

    // ── Status ──────────────────────────────────────────────
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Done", "Cancelled"],
      default: "Pending",
    },
    workshopNote: { type: String, default: "" },
  },
  { timestamps: true },
);

// Text search index
BookingSchema.index({
  "customer.name": "text",
  "customer.location": "text",
  "vehicle.make": "text",
  "vehicle.model": "text",
  "vehicle.plate": "text",
  "service.name": "text",
});

module.exports = mongoose.model("Booking", BookingSchema);
