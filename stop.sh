#!/bin/bash

# The Alankriti Stop Script
echo "🛑 Stopping The Alankriti Development Environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to kill process on port
kill_port() {
    local port=$1
    local service=$2
    if lsof -i :$port > /dev/null 2>&1; then
        echo -e "${YELLOW}Stopping $service on port $port...${NC}"
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 2
        if ! lsof -i :$port > /dev/null 2>&1; then
            echo -e "${GREEN}✅ $service stopped${NC}"
        else
            echo -e "${RED}❌ Failed to stop $service${NC}"
        fi
    else
        echo -e "${YELLOW}$service not running on port $port${NC}"
    fi
}

# Stop screen sessions
echo -e "${YELLOW}Stopping screen sessions...${NC}"
screen -S The Alankriti-backend -X quit 2>/dev/null || true
screen -S The Alankriti-frontend -X quit 2>/dev/null || true

# Stop Frontend (port 3000)
kill_port 3000 "Frontend"

# Stop Backend (port 3001)
kill_port 3001 "Backend"

# Clean up PID file
if [ -f .pids ]; then
    rm .pids
    echo -e "${GREEN}✅ Cleaned up PID file${NC}"
fi

echo ""
echo -e "${GREEN}🎉 All services stopped successfully!${NC}"
echo -e "${YELLOW}💡 To start again, run: ./start.sh${NC}"
