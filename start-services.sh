#!/usr/bin/env bash

BASE_DIR="/home/abhinav/.gemini/antigravity/scratch/telecare"
mkdir -p "$BASE_DIR/logs"

echo "Stopping any existing instances..."
fuser -k 5173/tcp 2>/dev/null || true
fuser -k 3001/tcp 2>/dev/null || true
fuser -k 8000/tcp 2>/dev/null || true
sleep 1

echo "Starting AI Service on port 8000..."
cd "$BASE_DIR/ai-service"
nohup python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 > "$BASE_DIR/logs/ai-service.log" 2>&1 &
echo $! > "$BASE_DIR/logs/ai-service.pid"

echo "Starting Backend Server on port 3001..."
cd "$BASE_DIR/server"
nohup node src/index.js > "$BASE_DIR/logs/server.log" 2>&1 &
echo $! > "$BASE_DIR/logs/server.pid"

echo "Starting Frontend Dev Server on port 5173..."
cd "$BASE_DIR/client"
nohup npx vite --host 0.0.0.0 --port 5173 > "$BASE_DIR/logs/client.log" 2>&1 &
echo $! > "$BASE_DIR/logs/client.pid"

sleep 3
echo "Checking service health..."
curl -s http://localhost:8000/health && echo " -> AI Service: OK" || echo " -> AI Service: Waiting..."
curl -s http://localhost:3001/api/doctors | head -c 50 && echo "... -> Backend: OK" || echo " -> Backend: Waiting..."
curl -s http://localhost:5173 | head -c 50 && echo "... -> Frontend: OK" || echo " -> Frontend: Waiting..."

echo "TeleCare services are active."
