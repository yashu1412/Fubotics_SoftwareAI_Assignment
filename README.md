# Yashpalsingh_Ramesh_Pawara_Fubotics_SoftwareAI_Assignment
Lise site : https://fubotics-software-ai-assignment-4y9.vercel.app/
AI Chat App with Saved History (Frontend + Backend) aligned to the assignment requirements.

## Overview
- User sends a message → backend stores it → backend queries an AI model → stores AI reply → frontend displays conversation → refresh shows history.
- Implemented with React (frontend), Node/Express (backend), MongoDB (persistence), and server-side AI integration.

## Tech Stack
- Frontend: React, Axios, Tailwind, Framer Motion
- Backend: Node.js, Express.js
- Persistence: MongoDB + Mongoose
- Auth: JWT (optional, used in this project)
- AI Provider: Google Gemini via `@google/genai` (server-only)

## Core Assignment Features
- Chat-style UI with input, send button, and message list.
- On page load, history is fetched and rendered.
- Backend saves user message, calls AI, saves AI reply, returns both.
- History persists across refreshes.

## Endpoints
- `GET /api/ai/history` — returns full stored chat history for the authenticated user.
- `POST /api/ai/message` — accepts `{ content, timezone, clientTimeISO }`, stores user message, calls AI, stores and returns assistant reply.
  - Implementation: `chatbot/backend/routes/ai.js:6` (history), `chatbot/backend/routes/ai.js:16` (message handling), direct date handling `chatbot/backend/routes/ai.js:50-57`.

## Key Files
- Frontend chat UI: `chatbot/frontend/src/components/AiChat.jsx`
  - Loads history: `chatbot/frontend/src/components/AiChat.jsx:15`
  - Sends message and shows response: `chatbot/frontend/src/components/AiChat.jsx:34`
- Backend route: `chatbot/backend/routes/ai.js`
- Message model: `chatbot/backend/models/AiMessage.js`
- Auth middleware: `chatbot/backend/middleware/auth.middleware.js`
- Route mounting: `chatbot/backend/app.js:19`

## Data Model
- `AiMessage`: `{ user: ObjectId, role: 'user' | 'assistant', content: string }` with timestamps.

## Environment Variables
Create `chatbot/backend/.env` with:
- `PORT=4000`
- `MONGODB_URI=<your mongodb srv uri>`
- `JWT_SECRET=<your jwt secret>`
- `GEMINI_API_KEY=<your gemini api key>`
- `GEMINI_MODEL=gemini-2.5-flash`
- `GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta` (optional)
- `TIMEZONE=<e.g. Asia/Kolkata>` (optional)

Frontend `.env`:
- `VITE_API_BASE_URL=http://localhost:4000`

## Run Locally
Backend
```
cd chatbot/backend
npm install
npm start
```

Frontend
```
cd chatbot/frontend
npm install
npm run dev
```

Open `http://localhost:5173` and ensure `VITE_API_BASE_URL` points to the running backend.

## Deployment (Free Hosting)
- Backend (Render/Railway):
  - Create a new web service from `chatbot/backend`, set environment variables from above, start command `node server.js`.
  - Note deployed URL, e.g. `https://your-backend.onrender.com`.
- Frontend (Vercel/Netlify):
  - Build from `chatbot/frontend` and set `VITE_API_BASE_URL` to the backend URL.
  - After deploy, verify `GET /api/ai/history` and `POST /api/ai/message` work from the frontend.

## Deliverables Checklist
- Live Hosted Web App (mandatory)
  - Frontend URL: `<paste here>`
  - Backend URL: `<paste here>`
- Screenshots (mandatory)
  - Chat interface showing user + AI replies
  - Page refresh still shows prior messages
  - Backend logs showing requests handled
  - Database view (Atlas) with saved `AiMessage` documents
- GitHub Repo Link (optional): `<paste here>`

Submission name: `Yashpalsingh_Ramesh_Pawara_Fubotics_SoftwareAI_Assignment`

## Notes
- AI SDK usage is server-side only to keep keys secure.
- Frontend sends `timezone` and `clientTimeISO` so the backend can reply accurately for date/time queries.
- Bold markdown `**` is stripped on display to keep responses clean.

