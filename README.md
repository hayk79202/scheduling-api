# Scheduling API

![Node build and test](https://github.com/hayk79202/scheduling-api/actions/workflows/ci.yml/badge.svg)

A small NestJS API for creating and rescheduling events. It validates requests, rejects overlapping time slots, and stores events in a local JSON file so they survive a restart.

## Run

```bash
npm ci
npm run start:dev
```

Node.js 20+ is recommended. The API listens on `http://localhost:3000` by default.

```bash
curl -X POST http://localhost:3000/events -H "Content-Type: application/json" --data-binary @examples/create-event.json
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

Run `npm test` for persistence, rescheduling, and conflict checks. GitHub Actions audits dependencies, builds and tests the API, and builds its Docker image on each push.

The Dockerfile runs the same API. Use a named volume to retain events after replacing the container:

```bash
docker build -t scheduling-api .
docker volume create scheduling-data
docker run -p 3000:3000 -v scheduling-data:/app/data scheduling-api
```

## Architecture and next steps

```text
HTTP request -> DTO validation -> EventsController -> EventsService -> JSON file
```

The current code is a single-process API. PostgreSQL persistence, Redis caching, JWT authentication, and multi-user scheduling are possible next steps; they are **not implemented here**.

## License

MIT
