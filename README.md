# ✅ Task Tracker

A full-stack task management application built with a **Node.js REST API** and a **Next.js** web frontend. Features JWT authentication, Redis caching, and MongoDB persistence.

## 📁 Project Structure

```
task-tracker/
├── backend/      → REST API (Express + Mongoose + Redis)
└── frontend/     → Web UI (Next.js)
```

---

## ⚙️ Prerequisites

Make sure these are installed before you begin:

- [Node.js 20 LTS](https://nodejs.org)
- [MongoDB](https://www.mongodb.com/docs/manual/installation/) — local 
- [Redis](https://redis.io/docs/install/) — local install


## 🚀 Getting Started

### 1 · Backend

# Navigate to the backend folder
cd backend

# Install dependencies
npm install

# Create your environment file
copy .env.example .env        # Windows

Open `.env` and fill in the two required values:

```env
# Local MongoDB connection
MONGODB_URI=mongodb://localhost:27017/task-tracker

# Generate a secure secret and paste it here:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your_generated_secret_here
```

Start the development server:
npm run dev

✅ The server is ready when you see:

```
✅ MongoDB connected
✅ Redis connected
🚀 Server running on http://localhost:4000
```
### 2 · Frontend

Open a **second terminal** and run:

# Navigate to the frontend folder
cd frontend

# Install dependencies
npm install

# Create your environment file
copy .env.local.example .env.local        # Windows

The `.env.local` file already points to your local backend and needs no changes:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Start the frontend:
npm run dev

---

## 🧪 Running Tests

cd backend

# Run all tests
npm test

# Run with coverage report (target: 70%+)
npm run test:coverage
```

Tests run fully in-memory — no external MongoDB or Redis required.  
Uses `mongodb-memory-server` and `ioredis-mock`.

---

## 🔐 Environment Variables

### Backend — `.env`

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default: `4000`) |
| `MONGODB_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | Secret for signing JWTs (32+ chars) |
| `JWT_EXPIRES_IN` | No | Token lifetime (default: `7d`) |
| `REDIS_HOST` | No | Redis host (default: `localhost`) |
| `REDIS_PORT` | No | Redis port (default: `6379`) |
| `FRONTEND_URL` | No | Allowed CORS origin (default: `http://localhost:3000`) |

### Frontend — `.env.local`

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | ✅ | Backend API base URL |

---

