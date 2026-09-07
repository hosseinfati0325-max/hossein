# حسین و فاطمه (Hossein & Fatemeh) — Production Architecture & Engineering Report

## 1. Executive Summary

This project has been architected as an **Enterprise Production-Grade Ecosystem** for the official Iranian and international language learning platform **«حسین و فاطمه»**, preserving all pedagogical features and user interfaces while establishing:

1. **Production Backend (FastAPI + Async SQLAlchemy + Redis + Celery)**
2. **PostgreSQL Relational Schema with Alembic Migrations (17 Tables)**
3. **Multi-AI Provider Gateway with Circuit Breakers & Fallbacks**
4. **Offline-First Native Android Architecture (Jetpack Compose + Room + Keystore)**
5. **Zero Client-Side Secret Leakage (All AI keys secured on the backend)**
6. **Containerization & CI/CD Pipeline (Docker Compose + GitHub Actions)**

---

## 2. Backend Architecture (`/backend`)

### Core Stack
- **Framework**: FastAPI (Async ASGI)
- **Database ORM**: SQLAlchemy 2.0 (Async Engine with `asyncpg` driver)
- **Cache & Message Broker**: Redis 7
- **Background Worker**: Celery
- **Security**: JWT (HMAC-SHA256) + Password Hashing (Argon2id & Bcrypt)
- **Observability**: Structured JSON logging (`structlog`), Request ID tracking, Latency profiling

### Directory Layout
```
backend/
├── alembic/                      # Database migrations
│   ├── versions/001_initial_schema.py
│   ├── env.py
│   └── script.py.mako
├── app/
│   ├── ai/                       # Multi-provider AI Gateway
│   │   ├── circuit_breaker.py    # Circuit breaker state machine
│   │   ├── gateway.py            # Priority failover orchestrator
│   │   ├── usage_tracker.py      # Latency & token analytics
│   │   └── providers/            # Gemini, OpenAI, Claude, OpenAI-Compatible
│   ├── api/v1/                   # RESTful versioned endpoints
│   │   ├── auth.py               # Register, Login, Refresh, Logout
│   │   ├── profile.py            # User profile, streak, leagues
│   │   ├── learning.py           # Grammar modules, vocabulary sets
│   │   ├── flashcards.py         # SM-2 Leitner spaced repetition
│   │   ├── mock_exams.py         # Dynamic diagnostic exam generator
│   │   ├── exams.py              # Standard language exams
│   │   ├── progress.py           # XP, achievements, mastery metrics
│   │   ├── ai_tutor.py           # Chat, Daily Word, Writing correction
│   │   └── admin.py              # Health check, provider config, telemetry
│   ├── core/                     # Infrastructure configuration
│   │   ├── config.py             # Pydantic v2 settings & env vars
│   │   ├── database.py           # Async session lifecycle
│   │   ├── redis.py              # Redis connection pool & rate limiter
│   │   ├── security.py           # JWT & password hashing
│   │   └── logging.py            # Structured JSON logger
│   ├── models/                   # Relational ORM models (17 tables)
│   ├── schemas/                  # Pydantic request/response validation
│   ├── services/                 # SM-2 engine, Exam scorer, Recommendation service
│   ├── tasks/                    # Celery asynchronous tasks
│   └── main.py                   # App entrypoint & CORS middleware
├── tests/                        # Pytest test suite
├── Dockerfile
├── requirements.txt
└── pyproject.toml
```

---

## 3. Database Schema (PostgreSQL 16)

The relational schema is defined with foreign keys, cascading constraints, unique constraints, and optimized indexes:

1. **`users`**: Authentication credentials, role (`student`, `admin`), active status.
2. **`profiles`**: Display name, target language, CEFR level (`A1`-`C2`), XP, streak, hearts, gems, league.
3. **`user_settings`**: Theme, TTS speed, notifications, offline preferences.
4. **`grammar_modules`**: Curriculum hierarchy by language and CEFR level.
5. **`grammar_lessons`**: Formulas, explanations, examples, common mistakes.
6. **`vocabulary_sets`**: Thematic word packs (Travel, Business, Academic).
7. **`vocabulary_words`**: Phonetics, parts of speech, target & Persian example sentences.
8. **`flashcards`**: SuperMemo SM-2 state: interval, repetitions, ease factor (bound `>= 1.3`), next review timestamp.
9. **`exams`**: Diagnostic tests and standard language certification simulations.
10. **`exam_questions`**: Questions categorized by grammar rules and vocabulary topics.
11. **`exam_attempts`**: Comprehensive historical records of user attempts with score percentages and CEFR estimates.
12. **`exam_answers`**: Per-question audit trail with selected answer and response duration.
13. **`learning_progress`**: Lesson completion tracking and crown levels.
14. **`vocabulary_progress`**: Word mastery percentages and mistake frequency counters.
15. **`grammar_progress`**: Grammar topic mastery and targeted remediation tracking.
16. **`ai_conversations` & `ai_messages`**: Chat history with tutor, provider audit logs, tokens used.
17. **`achievements` & `user_achievements`**: Gamification badges, milestones, and unlock criteria.

---

## 4. Multi-Provider AI Gateway

### High-Reliability Architecture
- **Failover Chain**: `Gemini 2.5 Flash` -> `OpenAI GPT-4o-mini` -> `Claude 3.5 Haiku` -> `OpenAI-Compatible Endpoint` -> `Deterministic Pedagogical Fallback`.
- **Circuit Breaker**: Each provider has an independent circuit breaker (`CLOSED` -> `OPEN` on consecutive errors -> `HALF_OPEN` probe).
- **Graceful Fallback**: If all external AI providers encounter network partitions, quota exhaustion, or 503 outages, the gateway returns pedagogical rule-based responses so the user's study session is never interrupted.
- **Security**: The Android app and Web frontend never possess AI credentials. All requests are routed through `/api/v1/ai/*` with token-bucket rate limiting.

---

## 5. Android Production Architecture (`/android`)

### Clean Architecture & Offline Synchronization
- **UI**: Jetpack Compose with Material 3, dynamic Persian RTL / English LTR support.
- **Local Cache**: Room Database (`CachedFlashcard`, `CachedProgress`) enabling full offline SRS review.
- **Remote**: Retrofit 2 + OkHttpClient with `AuthInterceptor` (attaching Bearer tokens) and automatic token rotation.
- **Keystore Security**: `SecurityManager` uses Android Keystore-backed `EncryptedSharedPreferences` (`AES256_GCM`).
- **Network Safety**: `network_security_config.xml` strictly enforces `cleartextTrafficPermitted="false"` and pins production domains (`api.linguapulse.app`). No temporary `ais-pre-*.run.app` URLs remain.

---

## 6. Deployment & CI/CD

- **Docker Compose**: Orchestrates PostgreSQL, Redis, FastAPI Backend, and Celery Worker with automatic health checks.
- **GitHub Actions**: Automated testing pipeline running Pytest and frontend build checks on every push and pull request.
