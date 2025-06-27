#!/bin/bash

# QAest MVP Startup Script

echo "🚀 Starting QAest MVP..."
echo "======================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

# Check if PostgreSQL is running
if ! pg_isready -h localhost -p 5432 &> /dev/null; then
    echo "⚠️  PostgreSQL is not running. Please start PostgreSQL service."
    echo "   On macOS: brew services start postgresql"
    echo "   On Ubuntu: sudo service postgresql start"
    exit 1
fi

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "❌ Port $1 is already in use"
        return 1
    else
        echo "✅ Port $1 is available"
        return 0
    fi
}

# Check required ports
echo ""
echo "Checking ports..."
check_port 8000 || exit 1
check_port 3000 || exit 1

echo "✅ Prerequisites check passed"

# Start backend server
echo ""
echo "🔧 Starting Backend Server (port 8000)..."
cd backend
nohup node server-basic.js > server.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait for backend to start
echo "Waiting for backend to start..."
sleep 3

# Check if backend is running
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Backend server is running on http://localhost:8000"
else
    echo "❌ Backend server failed to start"
    exit 1
fi

# Start frontend server
echo ""
echo "🎨 Starting Frontend Application (port 3000)..."
cd ../frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

echo "Starting React development server..."
echo "Frontend will open automatically in your browser..."

# Start frontend (this will block)
npm start

# This section will only run if npm start is interrupted
echo ""
echo "🛑 Shutting down..."
echo "Stopping backend server (PID: $BACKEND_PID)..."
kill $BACKEND_PID 2>/dev/null

echo "✅ QAest MVP stopped"
