# Task Tracker Service

Basic Node.js service boilerplate using the built-in HTTP module.

## Requirements

- Node.js 20 or newer recommended

## Getting Started

```bash
npm start
```

For development with automatic restart:

```bash
npm run dev
```

## Endpoints

- `GET /` - service welcome response
- `GET /health` - health check with uptime and timestamp

## Environment Variables

Copy `.env.example` to `.env` if you want to customize local settings.

```bash
HOST=localhost
PORT=3000
```
