# CLAUDE.md — Clover Project Rules

## Project Overview
Clover is a full-stack manga/manhwa tracking app.
- **Frontend**: React + Vite + TypeScript + Tailwind v3 (`clover-web/`)
- **Backend**: Micronaut 4 + Java 21 + PostgreSQL 16 (`clover-api/`)

## Local Development

### Backend
```bash
cd clover-api
./gradlew run          # start on :8080
./gradlew test         # run tests
./gradlew shadowJar    # build fat jar
```

### Frontend
```bash
cd clover-web
npm run dev            # start Vite dev server on :5173
npm run build          # production build
```

### Docker (full stack)
```bash
cp .env.example .env   # fill in secrets first
docker compose up      # postgres + api + web
```

## Brand & Design Rules

### Colors (never use default Tailwind blue/indigo)
- Primary: `clover-*` (forest green, 50–900)
- Accent: `gold-*` (warm amber)
- Surfaces: `surface-base` (#0d1117), `surface-elevated` (#161b22), `surface-floating` (#21262d)

### Typography
- Display/headings: Fraunces (serif)
- Body: Inter (sans-serif)
- Tight tracking (`-0.03em`) on large headings, generous line-height (`1.7`) on body

### Anti-Generic Rules
- **Shadows**: Never flat `shadow-md`. Use layered, color-tinted shadows with low opacity.
- **Gradients**: Layer multiple radial gradients. Add grain/texture via SVG noise for depth.
- **Animations**: Only animate `transform` and `opacity`. Never `transition-all`.
- **Interactive states**: Every clickable element needs hover, focus-visible, and active states.
- **Images**: Add gradient overlay (`bg-gradient-to-t from-black/60`) on manga covers.
- **Spacing**: Use intentional consistent spacing tokens — not random Tailwind steps.
- **Depth**: Surfaces have a layering system (base → elevated → floating).

## Hard Rules
- Do not use `transition-all`
- Do not use default Tailwind blue/indigo as primary color
- Tailwind v3 only (v4 config is incompatible)
- `hbm2ddl.auto: validate` — Flyway owns schema, Hibernate must not create/drop
- Chapter numbers always use `BigDecimal`/`NUMERIC(6,1)` — never `float`
- Genres stored as TEXT JSON string in DB — parse in service layer
