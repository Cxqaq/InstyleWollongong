# Instyle Massage Website

A straightforward full-stack massage shop website with a TypeScript frontend, Python FastAPI backend, and MongoDB persistence.

## Features

- Customer-friendly overview, location/contact, staff profiles, and weekly schedule.
- Responsive staff availability carousel for browsing the week.
- REST API boundaries for shop details, staff, schedule, and contact.
- MongoDB models and seed data for realistic massage shop content.
- Local demo fallback if MongoDB is not running, so the UI can still be reviewed.

## Project Structure

```text
frontend/          React + TypeScript + Vite UI
backend/app/       FastAPI application, schemas, repositories, routes
backend/tests/     Backend API tests
backend/seed.py    MongoDB seed script
```

## Environment

Create `backend/.env` from the example:

```bash
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=instyle_massage
API_CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
REQUIRE_MONGODB=false
ADMIN_USERNAME=your-admin-username
ADMIN_PASSWORD=your-admin-password
ADMIN_SESSION_SECRET=replace-with-a-long-random-secret
```

Set `REQUIRE_MONGODB=true` if the API should fail startup when MongoDB is unavailable. With the default `false`, the API uses in-memory sample data when MongoDB cannot be reached.
Set a unique `ADMIN_SESSION_SECRET` before deploying publicly. Use private Render environment variables for the real admin password.

## Setup

Install frontend dependencies:

```bash
npm --prefix frontend install
```

Install backend dependencies:

```bash
python -m pip install -r backend/requirements.txt
```

Seed MongoDB:

```bash
python backend/seed.py
```

Run the backend:

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000 --app-dir backend
```

Run the frontend in another terminal:

```bash
npm --prefix frontend run dev
```

Open http://127.0.0.1:5173.

## Checks

```bash
npm --prefix frontend run build
npm --prefix frontend run test
pytest backend/tests
```
