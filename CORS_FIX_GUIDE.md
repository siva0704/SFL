# CORS Issue Fix Guide

## Problem
The CORS (Cross-Origin Resource Sharing) issue was caused by:
1. **Port mismatch**: Frontend was trying to connect to `localhost:5000` but backend runs on `localhost:8000`
2. **Incomplete CORS configuration**: Missing support for Vite's default ports

## Changes Made

### Backend (`backend/src/index.ts`)
- Updated CORS configuration to allow multiple frontend ports:
  - `http://localhost:3000` (Create React App default)
  - `http://localhost:5173` (Vite default)
  - `http://localhost:4173` (Vite preview default)
- Added explicit methods and headers configuration

### Frontend (`frontend/src/services/api.ts`)
- Updated default API base URL from `http://localhost:5000/api/v1` to `http://localhost:8000/api/v1`

### Environment Files
- Updated `frontend/env.example` to use correct backend port
- Updated `backend/env.example` to match actual default port

## How to Start the Application

### 1. Start Backend
```bash
cd backend
npm install
npm run dev
```
Backend will start on `http://localhost:8000`

### 2. Start Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend will start on `http://localhost:5173` (Vite default)

### 3. Create Frontend Environment File (Optional)
If you want to customize the API URL, create a `.env` file in the frontend directory:
```bash
cd frontend
cp env.example .env
```

## Verification
1. Backend health check: `http://localhost:8000/health`
2. API documentation: `http://localhost:8000/api-docs`
3. Frontend should now connect to backend without CORS errors

## Port Summary
- **Backend**: `localhost:8000`
- **Frontend**: `localhost:5173` (Vite default)
- **API Base URL**: `http://localhost:8000/api/v1`

## Troubleshooting
If you still see CORS errors:
1. Ensure both servers are running
2. Check browser console for specific error messages
3. Verify the frontend is using the correct API base URL
4. Clear browser cache and reload
