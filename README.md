# 🔧 AutoFix Workshop Booking — Backend API

Node.js + Express + MongoDB REST API for the Workshop Booking app.

---

## 📁 Project Structure

```
workshop-backend/
├── server.js              ← Entry point
├── config/
│   └── db.js              ← MongoDB connection
├── models/
│   └── Booking.js         ← Mongoose schema
├── routes/
│   └── bookings.js        ← All CRUD routes
├── middleware/
│   └── errorHandler.js    ← Central error handling
├── .env.example           ← Copy to .env and fill values
└── package.json
```

---

## 🚀 Setup & Run

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
```
Edit `.env` and set your MongoDB URI:
```
MONGO_URI=mongodb://localhost:27017/workshop_booking
PORT=5000
```

### 3. Start the server
```bash
# Development (auto-restart on changes)
npm run dev

# Production
npm start
```

---

## 🗄️ MongoDB Options

**Local MongoDB:**
```
MONGO_URI=mongodb://localhost:27017/workshop_booking
```

**MongoDB Atlas (free cloud):**
1. Create account at https://cloud.mongodb.com
2. Create a free cluster
3. Get connection string → replace `<username>` and `<password>`
```
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/workshop_booking
```

---

## 📡 API Endpoints

| Method | Endpoint                        | Description              |
|--------|---------------------------------|--------------------------|
| GET    | `/`                             | Health check             |
| POST   | `/api/bookings`                 | Create new booking       |
| GET    | `/api/bookings`                 | List all (with filters)  |
| GET    | `/api/bookings/:id`             | Get single booking       |
| PATCH  | `/api/bookings/:id/status`      | Update status/note       |
| PUT    | `/api/bookings/:id`             | Full update              |
| DELETE | `/api/bookings/:id`             | Delete booking           |
| GET    | `/api/bookings/stats/summary`   | Dashboard stats          |

---

## 🔍 Query Parameters (GET /api/bookings)

```
?status=Pending          Filter by status
?search=toyota           Search name/plate/make/model
?date=2024-12-25         Filter by date
?page=1&limit=20         Pagination
```

**Example:**
```
GET /api/bookings?status=Pending&search=Ali&page=1&limit=10
```

---

## 📤 Request Examples

### Create Booking
```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "vehicle": { "make": "Toyota", "model": "Corolla", "year": 2020, "plate": "ABC-1234", "fuel": "Petrol" },
    "service": { "id": "oil", "name": "Oil Change", "price": "PKR 2,500", "duration": "45 min" },
    "slot":    { "date": "2024-12-25", "time": "10:00 AM – 11:00 AM" },
    "customer":{ "name": "Ali Hassan", "phone": "+92 300 1234567", "notes": "Engine makes noise" }
  }'
```

### Update Status
```bash
curl -X PATCH http://localhost:5000/api/bookings/<id>/status \
  -H "Content-Type: application/json" \
  -d '{ "status": "Confirmed", "workshopNote": "Parts ordered" }'
```

---

## 🌐 Connect to Frontend

In the HTML frontend, replace the `submitBooking()` localStorage save with:

```javascript
async function submitBooking() {
  // ... validation ...

  const res = await fetch('http://localhost:5000/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(booking)
  });
  const data = await res.json();
  if (data.success) {
    // show success message
  }
}
```

And replace `loadBookings()` with:
```javascript
async function loadBookings() {
  const res  = await fetch('http://localhost:5000/api/bookings');
  const data = await res.json();
  return data.data;
}
```
