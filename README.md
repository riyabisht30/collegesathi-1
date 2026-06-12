# Faraway 🎓

**AI-powered college admission tracker for first-generation students in India.**

Track admissions, compare 500+ colleges, never miss a deadline. Built with ❤️ for students who don't have anyone to guide them.

## Features

- **🔍 Browse Colleges** — Filter by state, stream, course level, college type, fees, and entrance exams
- **🎯 Smart Recommendations** — Monzy-style questionnaire that recommends 50-100 best colleges based on your preferences
- **⚡ Deadline Tracking** — See which applications are open, closing soon, or upcoming
- **❤️ Wishlist** — Save colleges (requires free account)
- **📱 Responsive** — Works on mobile, tablet, and desktop
- **🔐 Auth** — Google OAuth, Email, or Phone login
- **📄 Official Notifications** — Download links for admission notifications

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React, Tailwind CSS, Zustand, Framer Motion |
| Backend | FastAPI (Python), SQLAlchemy, Pydantic |
| Database | PostgreSQL |
| Auth | JWT + Google OAuth |
| Deployment | Vercel (frontend) + Railway (backend) |

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- PostgreSQL 14+

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Setup database
# Create a PostgreSQL database called 'faraway'
# Copy .env.example to .env and update DATABASE_URL

# Run migrations & seed data
python -m app.seed_data

# Start server
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Visit `http://localhost:3000`

### Environment Variables

Backend (`.env`):
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/faraway
SECRET_KEY=your-random-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FRONTEND_URL=http://localhost:3000
```

## Deployment

### Frontend → Vercel (Free)

1. Push code to GitHub
2. Import repo in [vercel.com](https://vercel.com)
3. Set root directory to `frontend`
4. Deploy

### Backend → Railway (Free)

1. Create project on [railway.app](https://railway.app)
2. Add PostgreSQL service
3. Deploy from GitHub (root: `backend`)
4. Set environment variables
5. Add start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

## Data

The seed script populates the database with:
- **500+** real and realistic Indian colleges (IITs, NITs, IIMs, AIIMS, DU colleges, state universities, private universities)
- **60+** courses across UG, PG, PhD
- **32** entrance exams (JEE, NEET, CUET, CAT, CLAT, etc.)
- Cutoff data, admission rounds, fees, and deadlines

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/colleges` | GET | List colleges with filters & pagination |
| `/api/colleges/{id}` | GET | College details |
| `/api/colleges/filters/options` | GET | Available filter values |
| `/api/recommend` | POST | Get recommendations based on questionnaire |
| `/api/auth/register` | POST | Create account |
| `/api/auth/login` | POST | Login |
| `/api/auth/google` | POST | Google OAuth |
| `/api/wishlist` | GET | Get wishlisted colleges |
| `/api/wishlist/toggle` | POST | Add/remove from wishlist |
| `/api/wishlist/ids` | GET | Get wishlist college IDs |

## Future Scope

- [ ] Real-time deadline scraper (DU, Mumbai Univ, JOSAA, NSP)
- [ ] Push notifications for deadline reminders
- [ ] AI-powered SOP writer
- [ ] Multilingual support (Hindi, Tamil, Bengali, Marathi)
- [ ] Voice notes for guidance
- [ ] College comparison tool
- [ ] Scholarship database
- [ ] Aadhaar-based form pre-fill
- [ ] WhatsApp bot integration

## License

MIT
