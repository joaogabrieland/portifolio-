#!/bin/bash
set -e
cd "$(dirname "$0")"

echo "$(date) — Pulling latest code..."
git pull origin main

echo "$(date) — Building..."
docker compose build

echo "$(date) — Deploying..."
docker compose up -d

sleep 10

STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ "$STATUS" = "200" ]; then
  echo "$(date) — Deploy SUCCESS (HTTP $STATUS)"
else
  echo "$(date) — Deploy FAILED (HTTP $STATUS)"
  docker compose logs --tail 50
fi
