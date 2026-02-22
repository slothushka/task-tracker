# ✅ Task Tracker 
A full-stack task management application built with a **Node.js REST API** and a **Next.js** web frontend. Features JWT authentication, Redis caching, and MongoDB persistence.


## 📁 Project Structure

```
task-tracker/
├── backend/      # REST API (Express + Mongoose + Redis)
└── frontend/     # Web UI (Next.js)
```

---

## 🧰 Tech Stack

### Backend

* Node.js 20
* Express
* MongoDB + Mongoose
* Redis
* JWT Authentication
* Jest (Testing)

### Frontend

* Next.js
* React
* Environment-based configuration

---

## ⚙️ Prerequisites

Make sure you have the following installed:

* [Node.js 20 LTS](https://nodejs.org)
* [MongoDB (Local Installation)](https://www.mongodb.com/docs/manual/installation/)
* [Redis (Local Installation)](https://redis.io/docs/install/)

---

# 🚀 Getting Started

## 1️⃣ Backend Setup

Open a terminal:

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install
```

### Create Environment File

```bash
# Windows
copy .env.example .env
```

Edit the `.env` file:

```env
# MongoDB connection
MONGODB_URI=mongodb://localhost:27017/task-tracker

# Generate a secure JWT secret:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your_generated_secret_here
```

### Start Backend Server

```bash
npm run dev
```

✅ You should see:

```
✅ MongoDB connected
✅ Redis connected
🚀 Server running on http://localhost:4000
```

---

## 2️⃣ Frontend Setup

Open a **second terminal**:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install
```

### Create Environment File

```bash
# Windows
copy .env.local.example .env.local
```

`.env.local` (no changes required):

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### Start Frontend

```bash
npm run dev
```

Frontend runs on:

```
http://localhost:3000
```

---

# 🧪 Running Tests

Navigate to backend:

```bash
cd backend
```

### Run Tests

```bash
npm test
```

### Run With Coverage (Target: 70%+)

```bash
npm run test:coverage
```

✅ Tests run fully **in-memory**
No external MongoDB or Redis required.

Uses:

* `mongodb-memory-server`
* `ioredis-mock`

---

# 🔐 Environment Variables

## Backend — `.env`

| Variable         | Required | Default                 | Description                                     |
| ---------------- | -------- | ----------------------- | ----------------------------------------------- |
| `PORT`           | ❌        | `4000`                  | Server port                                     |
| `MONGODB_URI`    | ✅        | —                       | MongoDB connection string                       |
| `JWT_SECRET`     | ✅        | —                       | Secret for signing JWTs (32+ chars recommended) |
| `JWT_EXPIRES_IN` | ❌        | `7d`                    | Token lifetime                                  |
| `REDIS_HOST`     | ❌        | `localhost`             | Redis host                                      |
| `REDIS_PORT`     | ❌        | `6379`                  | Redis port                                      |
| `FRONTEND_URL`   | ❌        | `http://localhost:3000` | Allowed CORS origin                             |

---

## Frontend — `.env.local`

| Variable              | Required | Description          |
| --------------------- | -------- | -------------------- |
| `NEXT_PUBLIC_API_URL` | ✅        | Backend API base URL |

---

# 🛡️ Authentication Flow

1. User signs up → Password is hashed
2. User logs in → JWT is generated
3. JWT is sent in `Authorization` header
4. Protected routes verify token
5. Redis caches frequently accessed data

---

