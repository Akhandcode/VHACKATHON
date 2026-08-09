# ARCHITECTURE
## Autonomous AI Creator Engine

**Role:** Principal Architect & Creative Technologist
**Strategy:** Option A (Bleeding-Edge Hybrid)
**Core Tech:** Python + Next.js + Supabase + WebGL

---

## 1. Production-Grade File System Hierarchy

Modular, clean-architecture repository layout structured for multi-runtime serverless deployment on Vercel, with Python FastAPI microservices and a Next.js React Three Fiber frontend:

```
autonomous-ai-creator/
├── .github/
│   └── workflows/
│       ├── deploy.yml                     # CI/CD pipeline for Vercel & Supabase migrations
│       └── python-tests.yml               # Pytest verification for AI pipeline logic
├── api/                                   # Python FastAPI Vercel Serverless Microservices
│   ├── index.py                           # Entry point exposing ASGI app for Vercel execution
│   ├── core/
│   │   ├── config.py                      # Pydantic BaseSettings for env vars & LLM keys
│   │   ├── security.py                    # JWT verification middleware & Supabase token validation
│   │   └── database.py                    # Async Engine (SQLAlchemy 2.0 / asyncpg) connection pool
│   ├── services/
│   │   ├── scraper.py                     # Async web/RSS/ArXiv ingestion client (httpx)
│   │   ├── editorial.py                   # LLM topic evaluation, scoring, and rejection logic
│   │   ├── vector_store.py                # Vector embeddings generation & pgvector similarity search
│   │   └── generator.py                   # Post drafting, persona voice enforcement, critique loop
│   └── routers/
│       ├── init.py                        # POST /api/agent/init endpoint
│       ├── feed.py                        # GET /api/agent/feed endpoint
│       └── worker.py                      # Async QStash queue background execution tick endpoint
├── app/                                   # Next.js 14+ App Router (Frontend + Edge API Layer)
│   ├── (auth)/
│   │   ├── login/page.tsx                 # OAuth / Magic Link auth flow UI
│   │   └── layout.tsx                     # Centered glassmorphic container layout
│   ├── (dashboard)/
│   │   ├── feed/page.tsx                  # Main real-time interactive 3D post feed
│   │   ├── analytics/page.tsx             # Live metric charts & rejected topics audit log
│   │   └── layout.tsx                     # Dashboard navigation sidebar & WebGL persistent canvas
│   ├── api/
│   │   ├── stripe/
│   │   │   └── webhook/route.ts           # Stripe payment event processor (Next.js Edge Route)
│   │   └── py/[...path]/route.ts          # Next.js proxy rewrite layer pointing to Python FastAPI
│   ├── layout.tsx                         # Global root layout, font loaders, ThemeProvider
│   ├── page.tsx                           # Landing page with interactive WebGL hero background
│   └── globals.css                        # Tailwind CSS directives & global custom CSS variables
├── components/
│   ├── 3d/                                # Three.js / React Three Fiber Canvas Elements
│   │   ├── SceneCanvas.tsx                # Main R3F Canvas wrapper with Canvas/OrbitControls/Perf
│   │   ├── FeedParticleNode.tsx           # Floating 3D WebGL nodes representing posts in space
│   │   ├── PostCard3D.tsx                 # HTML3D/Flex mesh card renderer inside WebGL scene
│   │   └── Shaders/
│   │       ├── auraVertex.glsl            # Custom GLSL vertex shader for glowing aura effects
│   │       └── auraFragment.glsl          # Custom GLSL fragment shader for animated noise glow
│   ├── ui/                                # Radix UI + Framer Motion Component Library
│   │   ├── Button.tsx                     # Custom micro-animated interactive button
│   │   ├── PostCard.tsx                   # Post item card with animated rationale expander
│   │   └── RealtimeStatusBadge.tsx        # Live socket connectivity indicator with pulsing animation
│   └── canvas/
│       └── OverlayUI.tsx                  # HUD overlay rendering on top of the 3D scene
├── lib/
│   ├── supabase/
│   │   ├── client.ts                      # Browser-side Supabase client initialization
│   │   ├── server.ts                      # Server Component Supabase client using cookies
│   │   └── middleware.ts                  # Next.js auth guard middleware refreshing sessions
│   ├── hooks/
│   │   ├── useRealtimeFeed.ts             # React hook listening to Supabase Postgres CDC changes
│   │   └── use3DAnimation.ts              # GSAP timeline hook binding scroll/hover to 3D meshes
│   └── utils/
│       ├── formatters.ts                  # Date, ISO 8601 UTC, and currency formatting helpers
│       └── constants.ts                   # Persona defaults, UI state constants
├── supabase/
│   ├── migrations/
│   │   ├── 20260809000000_init_schema.sql     # Tables: agent_state, posts, rejected_topics
│   │   └── 20260809000001_pgvector_setup.sql  # Extension pgvector, match_posts function
│   └── seed.sql                           # Initial test data for persona testing
├── public/
│   └── textures/                          # WebGL texture maps (HDR maps, noise textures)
├── requirements.txt                       # Python dependencies (FastAPI, httpx, pydantic, openai)
└── package.json                           # Node.js dependencies (Next, R3F, GSAP, Framer Motion)
```

---

## 2. Data Flow & Execution Sequence

1. **Upstash QStash Trigger:** Dispatches HTTP POST tick every 15 minutes to Python FastAPI microservice.
2. **Async Processing Pipeline:** Scrapes live RSS/web feeds → Computes OpenAI vector embeddings → Executes `match_posts` pgvector query.
3. **LLM Editorial Gatekeeper:** Filters out redundant or low-signal topics → Drafts post in persona voice with rationale & source metadata.
4. **Database Commitment:** Inserts published post into Supabase PostgreSQL database table.
5. **Real-time Broadcast:** Supabase CDC WebSockets emit insertion event → React Three Fiber UI dynamically spawns glowing 3D node with GSAP spring animations.

---

## 3. Database & Auth Architecture (Supabase + pgvector)

- **Relational Tables:** `agent_state` (persona metadata), `posts` (feed output with UTC timestamps), and `rejected_topics` (audit logs).
- **Vector Deduplication Stored Procedure:** SQL function `match_posts` performing cosine-distance similarity checks against previously published topics over 48 hours.
- **Security Posture:** Row Level Security (RLS) granting public read access to feeds while locking write rights to authenticated service accounts.

---

## 4. Architecture & Tech Stack Impact (from constraint analysis)

Requires a dedicated persistence layer for `AgentState`, `PublishedPosts`, and `RejectedTopics`. The orchestration engine must rely on Node.js/Python with an internal scheduler (e.g., node-cron, Celery, or serverless cron triggers like Upstash QStash) executing every N minutes.

---
*Principal Architect Blueprint | Option A Strategy*