# Scheduling API

A NestJS starter API for creating and listing scheduled events. It demonstrates request validation, a small service layer, and a predictable REST shape.

## Run

```bash
npm install
npm run start:dev
```

Node.js 20+ is recommended. The API listens on `http://localhost:3000` by default.

```bash
curl -X POST http://localhost:3000/events -H "Content-Type: application/json" -d '{"title":"Design review","startsAt":"2026-11-01T10:00:00.000Z"}'
curl http://localhost:3000/events
```

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Health check |
| `GET` | `/events` | List events |
| `POST` | `/events` | Create an event |
| `GET` | `/events/:id` | Fetch an event |
| `DELETE` | `/events/:id` | Delete an event |

Validation requires a nonempty title and an ISO 8601 timestamp. Events are held in memory and disappear on restart.

## Architecture and next steps

```text
HTTP request -> DTO validation -> EventsController -> EventsService -> in-memory store
```

The current code is an API prototype. PostgreSQL persistence, Redis caching, JWT authentication, Docker deployment, and Jest/Supertest tests are planned extensions, not features claimed by this repository today. Those additions would make it closer to the production architecture in the project brief.

## License

MIT
