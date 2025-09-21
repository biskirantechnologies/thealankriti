#!/bin/bash

# TheAlankriti Startup Script
echo "🚀 Starting TheAlankriti Development Environment..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Create logs directory if it doesn't exist
mkdir -p logs

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -i :$port > /dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to kill process on port
kill_port() {
    local port=$1
    echo -e "${YELLOW}Stopping existing process on port $port...${NC}"
    lsof -ti:$port | xargs kill -9 2>/dev/null || true
    sleep 2
}

# Check and handle backend (port 3001)
if check_port 3001; then
    echo -e "${YELLOW}Backend already running on port 3001${NC}"
    read -p "Do you want to restart it? (y/N): " restart_backend
    if [[ $restart_backend =~ ^[Yy]$ ]]; then
        kill_port 3001
    fi
fi

# Check and handle frontend (port 3000)  
if check_port 3000; then
    echo -e "${YELLOW}Frontend already running on port 3000${NC}"
    read -p "Do you want to restart it? (y/N): " restart_frontend
    if [[ $restart_frontend =~ ^[Yy]$ ]]; then
        kill_port 3000
    fi
fi

# Start MongoDB if not running
if ! pgrep -f mongod > /dev/null; then
    echo -e "${RED}MongoDB is not running. Please start MongoDB first:${NC}"
    echo "brew services start mongodb/brew/mongodb-community"
    exit 1
fi

echo -e "${GREEN}✅ MongoDB is running${NC}"

# Start Backend in screen session if not running
if ! check_port 3001; then
    echo -e "${BLUE}🔧 Starting Backend Server...${NC}"
    screen -dmS thealankriti-backend bash -c "cd backend && npm start > ../logs/backend.log 2>&1"
    echo -e "${GREEN}✅ Backend started in screen session 'thealankriti-backend'${NC}"
    
    # Wait for backend to be ready
    echo -e "${YELLOW}⏳ Waiting for backend to be ready...${NC}"
    for i in {1..30}; do
        if curl -s http://localhost:3001/health > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Backend is ready!${NC}"
            break
        fi
        sleep 1
        if [ $i -eq 30 ]; then
            echo -e "${RED}❌ Backend failed to start properly${NC}"
        fi
    done
else
    echo -e "${GREEN}✅ Backend already running${NC}"
fi

# Start Frontend in screen session if not running
if ! check_port 3000; then
    echo -e "${BLUE}🎨 Starting Frontend Server...${NC}"
    screen -dmS thealankriti-frontend bash -c "cd frontend && npm start > ../logs/frontend.log 2>&1"
    echo -e "${GREEN}✅ Frontend started in screen session 'thealankriti-frontend'${NC}"
    
    # Wait for frontend to be ready
    echo -e "${YELLOW}⏳ Waiting for frontend to be ready...${NC}"
    for i in {1..60}; do
        if curl -s http://localhost:3000 > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Frontend is ready!${NC}"
            break
        fi
        sleep 1
        if [ $i -eq 60 ]; then
            echo -e "${RED}❌ Frontend failed to start properly${NC}"
        fi
    done
else
    echo -e "${GREEN}✅ Frontend already running${NC}"
fi

echo ""
echo -e "${GREEN}🎉 TheAlankriti is now running!${NC}"
echo -e "${BLUE}📱 Frontend: http://localhost:3000${NC}"
echo -e "${BLUE}🔧 Backend:  http://localhost:3001${NC}"  
echo -e "${BLUE}💾 Admin:    http://localhost:3000/admin${NC}"
echo ""
echo -e "${YELLOW}📋 Useful Commands:${NC}"
echo "  - View backend logs: tail -f logs/backend.log"
echo "  - View frontend logs: tail -f logs/frontend.log"
echo "  - View backend session: screen -r thealankriti-backend"
echo "  - View frontend session: screen -r thealankriti-frontend"
echo "  - Stop all: ./stop.sh"
echo ""
echo -e "${GREEN}✨ Happy coding!${NC}"
