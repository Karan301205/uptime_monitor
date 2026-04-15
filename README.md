# Uptime Monitoring System

## Overview

A full-stack web application that monitors website uptime, tracks response times, and logs downtime incidents. Users receive real-time insights through a clean dashboard.

---

## Tech Stack

### Frontend

* React.js
* Tailwind CSS
* Axios
* Recharts

### Backend

* Node.js
* Express.js
* JWT Authentication
* Google OAuth

---

## Features

* User Authentication (JWT + Google Login)
* Add & Monitor Websites
* Real-time Response Time Graphs
* Incident Tracking System
* User Profile Dashboard
* Modern UI with Tailwind

---

## Project Structure

* `/pages` → UI pages (Login, Dashboard, Profile)
* `/api.js` → Axios configuration
* `/components` → UI components (if any)

---

## How It Works

1. User logs in and receives JWT token
2. Token stored in localStorage
3. Axios sends token in every request
4. Backend monitors URLs and logs data
5. Dashboard displays uptime, logs, and incidents

---

## Setup Instructions

```bash
npm install
npm run dev
```

---

## API Base URL

```
https://uptime-monitor-xipl.onrender.com/api
```

---

## Future Improvements

* Email/SMS alerts
* Custom monitoring intervals
* Multi-region monitoring
* Dark/light theme toggle
* Role-based access control

---

## Author

Karan
