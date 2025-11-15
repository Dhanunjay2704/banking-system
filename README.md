# Banking System

Simple banking web application (Express + MongoDB backend, React frontend).
To view the application : https://banking-system-frontend-y28b.onrender.com/

## What this repo contains
- `backend/` - Express API, MongoDB models, routes and scripts
- `frontend/` - React SPA (Create React App)

## Quick local run

1. Set environment variables for backend: create `backend/.env` from `.env.example` and fill values (do NOT commit `.env`).
2. Start backend:
	 - Open terminal in `backend` and run:
		 ```powershell
		 npm install
		 npm run dev   # or npm start for production
		 ```
3. Start frontend:
	 - Open terminal in `frontend` and run:
		 ```powershell
		 npm install
		 npm start
		 ```

## Important env vars

- Backend (`backend/.env` on Render environment variables):
	- `MONGO_URI` - MongoDB Atlas connection string
	- `JWT_SECRET` - JWT secret
	- `NODE_ENV` - `production`
	- `FRONTEND_URL` - frontend URL to allow in CORS (e.g. `https://your-frontend.onrender.com`)

- Frontend (set `REACT_APP_API_URL` in Render or in `frontend/.env.production`):
	- `REACT_APP_API_URL` - e.g. `https://your-backend.onrender.com/api`

## Seeded admin (for testing)
- Email: `admin@bank.com`
- Password: `admin123`

## Deployment (Render) - summary
1. Push code to GitHub (this repo).
2. Create a Render **Web Service** for the backend with root directory `backend` and set the backend env vars.
3. Create a Render **Static Site** for the frontend with root directory `frontend`, build command `npm install && npm run build`, and set `REACT_APP_API_URL` to your backend URL.
4. Add `_redirects` in `frontend/public` (already present) so client-side routes work.

