# Inventory Admin Panel

MERN-style admin panel based on the provided sketch.

## Tech Stack

- React + Vite frontend
- Node.js + Express backend
- MongoDB Atlas via Mongoose

## Setup

1. Install dependencies:

```bash
npm run install:all
npm install
```

2. Copy the server environment file:

```bash
copy server\.env.example server\.env
```

3. Add your MongoDB Atlas connection string in `server/.env`:

```env
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/admin-panel
```

4. Run both apps:

```bash
npm run dev
```

Frontend: `http://localhost:5173`

Backend: `http://localhost:5000`
