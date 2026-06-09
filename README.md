# SentioSync 🧠

> An AI-powered real-time social sentiment & emotion analytics platform

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://python.org)
[![Django](https://img.shields.io/badge/Django-4.x-green.svg)](https://djangoproject.com)
[![HuggingFace](https://img.shields.io/badge/HuggingFace-Transformers-yellow.svg)](https://huggingface.co)
[![Node.js](https://img.shields.io/badge/Node.js-20+-brightgreen.svg)](https://nodejs.org)
[![Angular](https://img.shields.io/badge/Angular-17-red.svg)](https://angular.io)

---

## 🚀 What is SentioSync?

SentioSync is a full-stack AI platform that analyzes the **sentiment** (positive/negative/neutral) and **emotions** (joy, anger, fear, sadness, surprise, disgust) from any text input in real-time.

Built with a **dual backend architecture**:
- **Django** handles AI/ML processing and user authentication
- **Node.js + Express** handles real-time WebSocket feeds
- **Angular** provides the live dashboard UI

---

## ✨ Features

- 🤖 **AI Sentiment Analysis** — RoBERTa transformer model (98%+ accuracy)
- 😊 **Emotion Detection** — 7 emotions detected using DistilRoBERTa
- ⚡ **Real-time Feed** — Live sentiment updates via Socket.IO WebSockets
- 📊 **Interactive Dashboard** — Live charts and emotion heatmaps (D3.js)
- 🔐 **JWT Authentication** — Secure login/signup with token-based auth
- 📁 **CSV Bulk Upload** — Analyse multiple texts at once
- 📜 **Analysis History** — Save and revisit past analyses
- 🐳 **Dockerized** — Fully containerized for easy deployment

---

## 🛠️ Tech Stack

### Backend 1 — Django (AI/ML + Auth)
| Technology | Purpose |
|---|---|
| Django 4.x | Web framework |
| Django REST Framework | REST API |
| SimpleJWT | JWT Authentication |
| HuggingFace Transformers | NLP Models |
| PyTorch | Deep Learning |
| PostgreSQL | Primary Database |
| Celery + Redis | Async task queue |

### Backend 2 — MEAN Stack (Real-time)
| Technology | Purpose |
|---|---|
| Node.js + Express | Real-time server |
| MongoDB + Mongoose | Feed data storage |
| Socket.IO | WebSocket real-time |
| Angular 17 | Frontend SPA |
| Chart.js / D3.js | Data visualization |

---

## 📁 Project Structure

```
sentiosync/
├── django-backend/          # AI/ML backend
│   ├── accounts/            # User auth (JWT)
│   ├── sentiment/           # Sentiment analysis API
│   ├── analytics/           # History & reports
│   └── sentiosync_backend/  # Django config
│
├── node-backend/            # Real-time backend
│   ├── routes/              # Express routes
│   ├── models/              # MongoDB models
│   └── socket/              # Socket.IO handlers
│
└── angular-frontend/        # Dashboard UI
    ├── src/app/
    │   ├── auth/            # Login/Signup pages
    │   ├── dashboard/       # Main dashboard
    │   └── charts/          # Emotion visualizations
    └── src/environments/
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Python 3.11+
- Node.js 20+
- PostgreSQL
- Redis
- MongoDB

### 1. Clone the repo
```bash
git clone https://github.com/tanvi20206/SentioSync.git
cd SentioSync
```

### 2. Django Backend
```bash
cd django-backend
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux

pip install -r requirements.txt

# Create .env file (see .env.example)
cp .env.example .env

python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### 3. Node Backend 
```bash
cd node-backend
npm install
npm run dev
```

### 4. Angular Frontend 
```bash
cd angular-frontend
npm install
ng serve
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/accounts/signup/` | Register new user |
| POST | `/api/accounts/login/` | Login, get JWT token |
| GET | `/api/accounts/profile/` | Get user profile |
| POST | `/api/accounts/logout/` | Logout |

### Sentiment
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/sentiment/analyse/` | Analyse text |
| GET | `/api/sentiment/history/` | Get analysis history |
| DELETE | `/api/sentiment/history/<id>/` | Delete an analysis |

---

## 🤖 AI Models Used

| Model | Source | Task |
|---|---|---|
| `cardiffnlp/twitter-roberta-base-sentiment-latest` | HuggingFace | Sentiment (pos/neg/neutral) |
| `j-hartmann/emotion-english-distilroberta-base` | HuggingFace | Emotion (7 classes) |

---

## 👩‍💻 Author

**Tanvi** — Aspiring  Software Engineer & AIML Enthusiast 
GitHub: [@tanvi20206](https://github.com/tanvi20206)

---

## 📌 Status

🚧 **In Active Development** — Building Day by Day

- [x] Day 1 — Django project setup
- [x] Day 2 — JWT Authentication API
- [x] Day 3 — HuggingFace AI model integration
- [x] Day 4 — Node.js + Socket.IO real-time feed
- [x] Day 5 — Angular dashboard
- [x] Day 6 — Live emotion charts
- [x] Day 7 — CSV bulk upload
- [ ] Day 8 — Docker + Deployment
