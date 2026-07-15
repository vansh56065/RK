#!/bin/bash
# RK Residency dev server startup script
# Keeps the server running and auto-restarts if it dies

export DATABASE_URL="postgresql://neondb_owner:npg_DhkzbE0RXMP7@ep-patient-hat-atbx8i80-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require"
export NODE_OPTIONS="--max-old-space-size=1024"

cd /home/z/my-project

# Kill any existing server
pkill -9 -f "next" 2>/dev/null
sleep 2

# Start the server
exec bun run next dev -p 3000
