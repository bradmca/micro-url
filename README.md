<div align="center">

# ⚡ Micro-URL ⚡
### *The Production-Ready URL Shortener with Analytics*

[![CI/CD Pipeline](https://github.com/bradmca/micro-url/actions/workflows/ci.yml/badge.svg)](https://github.com/USER_NAME/micro-url/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-blue.svg)](CONTRIBUTING.md)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-20232a?style=flat&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=flat&logo=redis&logoColor=white)](https://redis.io/)

---

**Micro-URL** is a high-performance URL shortener built for marketers, developers, and speed enthusiasts. It features a sleek glassmorphism admin dashboard, real-time analytics, and Redis-backed redirects for sub-millisecond performance.

[Explore Docs](http://localhost:8000/docs) · [Report Bug](https://github.com/USER_NAME/micro-url/issues) · [Request Feature](https://github.com/USER_NAME/micro-url/issues)

</div>

## ✨ Features

- 🚀 **Blazing Fast Redirects**: Powered by a multi-layer Redis cache.
- 📊 **Rich Analytics**: Track clicks, countries, device types, browsers, and referrers.
- 🎨 **Glassmorphism Dashboard**: A premium, responsive UI with interactive charts.
- 🛡️ **Privacy Focused**: Minimal logs, no cookie tracking for visitors.
- 🔗 **Custom Slugs**: Create branded links that actually convert.
- 🐳 **Full Docker Support**: One-command setup for production and staging.

## 📸 visual Preview

![Micro-URL Dashboard](https://raw.githubusercontent.com/USER_NAME/micro-url/main/assets/preview.png)
*(Replace this with a real GIF of your dashboard!)*

## 🛠️ Tech Stack

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Backend** | [FastAPI](https://fastapi.tiangolo.com/) | Async API Layer |
| **Frontend** | [React](https://react.dev/) + [Vite](https://vitejs.dev/) | Admin Dashboard |
| **Cache** | [Redis](https://redis.io/) | URL Redirects & Counters |
| **Database** | [PostgreSQL](https://www.postgresql.org/) | Permanent Persistence |
| **Charts** | [Recharts](https://recharts.org/) | Visual Analytics |
| **DevOps** | [Docker](https://www.docker.com/) | Local & Production Env |

## 🚀 Quick Start

### The "I'm in a hurry" way (Docker)

```bash
# Clone the repository
git clone https://github.com/USER_NAME/micro-url.git
cd micro-url

# Fire up the stack
docker-compose up --build
```
- **Backend API**: `http://localhost:8000`
- **Dashboard**: `http://localhost:5173` (Runs separately via `npm run dev`)

### The "I like to control everything" way

#### Backend Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 📈 Analytics Deep Dive

Micro-URL doesn't just shorten links; it gives you the story behind the click.

- **Geographic Data**: Automatically geolocated country and city tracking.
- **Device Breakdown**: mobile vs Desktop optimization stats.
- **Acquisition**: Identify top referrers (Social, Direct, Search).
- **Time Analysis**: Hourly and daily traffic patterns.

## 🤝 Community Standards

We maintain high standards for our codebase and community.

- **[CONTRIBUTING.md](CONTRIBUTING.md)**: How to get involved.
- **[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)**: Our promise to you.
- **[LICENSE](LICENSE)**: MIT License.

## 🛣️ Roadmap

- [ ] Email reports for link performance.
- [ ] QR Code generation for every link.
- [ ] expiration dates for self-destructing links.
- [ ] API keys for team management.

---
⭐ If this project helps you, please give it a star!
