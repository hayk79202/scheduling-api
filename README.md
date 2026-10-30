# Scheduling API

A small NestJS API for creating and rescheduling events. It validates requests, rejects overlapping time slots, and stores events in a local JSON file so they survive a restart.

## Run

```bash
npm install
npm run start:dev
```

Node.js 20+ is recommended. The API listens on `http://localhost:3000` by default.

```bash
curl -X POST http://localhost:3000/events -H "Content-Type: application/json" -d '{"title":"Design review","startsAt":"2026-11-01T10:00:00.000Z","endsAt":"2026-11-01T11:00:00.000Z"}'
curl http://localhost:3000/events
```

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Health check |
| `GET` | `/events` | List events |
| `POST` | `/events` | Create an event |
| `GET` | `/events/:id` | Fetch an event |
| `PUT` | `/events/:id` | Replace an event and recheck conflicts |
| `DELETE` | `/events/:id` | Delete an event |

Validation requires a title with visible text and ISO 8601 timestamps. `endsAt` must follow `startsAt`. An overlapping event returns HTTP `409`. Events are written to `data/events.json`; set `SCHEDULING_DATA_FILE` to choose another file. Run one server process for this version.

Run `npm test` for persistence, rescheduling, and conflict checks. GitHub Actions builds and tests the API on each push.

The Dockerfile runs the same API: `docker build -t scheduling-api .` then `docker run -p 3000:3000 -v ./data:/app/data scheduling-api`. Mount `/app/data` to retain events after replacing the container.

## Architecture and next steps

```text
HTTP request -> DTO validation -> EventsController -> EventsService -> JSON file
```

The current code is a single-process API. PostgreSQL persistence, Redis caching, JWT authentication, and multi-user scheduling are possible next steps; they are **not implemented here**.

## License

MIT
