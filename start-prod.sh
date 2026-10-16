#!/bin/bash
set -e

# Start Python AI microservice in background
cd /app/ai-service
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 &

# Give AI service a moment to start
sleep 2

# Start Express backend (serves React build + API)
cd /app/server
exec node src/index.js
