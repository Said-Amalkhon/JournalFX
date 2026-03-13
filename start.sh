#!/bin/bash
echo "Starting JournalFX..."

# Start backend
cd backend
node --experimental-sqlite server.js &
BACKEND_PID=$!
echo "Backend running at http://localhost:4000 (PID: $BACKEND_PID)"

# Start frontend
cd ../frontend
npm run dev &
FRONTEND_PID=$!
echo "Frontend running at http://localhost:3000 (PID: $FRONTEND_PID)"

echo ""
echo "Open http://localhost:3000 in your browser"
echo "Press Ctrl+C to stop both servers"

# Wait and cleanup on exit
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Servers stopped.'" EXIT
wait
