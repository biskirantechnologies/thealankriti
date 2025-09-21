#!/bin/bash

# TheAlankriti Status Check Script
echo "📊 TheAlankriti Development Environment Status"
echo "================================================"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -i :$port > /dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Check MongoDB
echo -e "\n${BLUE}🗄️  Database Status:${NC}"
if pgrep -f mongod > /dev/null; then
    echo -e "${GREEN}✅ MongoDB is running${NC}"
else
    echo -e "${RED}❌ MongoDB is not running${NC}"
fi

# Check Backend (port 3001)
echo -e "\n${BLUE}🔧 Backend Status (Port 3001):${NC}"
if check_port 3001; then
    echo -e "${GREEN}✅ Backend is running${NC}"
    # Test health endpoint
    if curl -s http://localhost:3001/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend API is responding${NC}"
        curl -s http://localhost:3001/health | jq .
    else
        echo -e "${YELLOW}⚠️  Backend port is occupied but API not responding${NC}"
    fi
else
    echo -e "${RED}❌ Backend is not running${NC}"
fi

# Check Frontend (port 3000)
echo -e "\n${BLUE}🎨 Frontend Status (Port 3000):${NC}"
if check_port 3000; then
    echo -e "${GREEN}✅ Frontend is running${NC}"
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend is accessible${NC}"
    else
        echo -e "${YELLOW}⚠️  Frontend port is occupied but not accessible${NC}"
    fi
else
    echo -e "${RED}❌ Frontend is not running${NC}"
fi

# Check screen sessions
echo -e "\n${BLUE}🖥️  Screen Sessions:${NC}"
if screen -list | grep -q thealankriti-backend; then
    echo -e "${GREEN}✅ Backend is running (Screen: thealankriti-backend)${NC}"
    BACKEND_RUNNING=true
else
    echo -e "${RED}❌ Backend is not running${NC}"
fi

if screen -list | grep -q thealankriti-frontend; then
    echo -e "${GREEN}✅ Frontend screen session exists${NC}"
else
    echo -e "${YELLOW}⚠️  No frontend screen session${NC}"
fi

# Summary
echo -e "\n${BLUE}📋 Quick Actions:${NC}"
echo "  - Start all services: ./start.sh"
echo "  - Stop all services: ./stop.sh"
echo "  - View this status: ./status.sh"
echo "  - View backend logs: tail -f logs/backend.log"
echo "  - View frontend logs: tail -f logs/frontend.log"
echo ""

if check_port 3000 && check_port 3001; then
    echo -e "${GREEN}🎉 All services are running!${NC}"
    echo -e "${BLUE}🌐 Website: http://localhost:3000${NC}"
    echo -e "${BLUE}📊 Admin: http://localhost:3000/admin${NC}"
    echo -e "${BLUE}🔧 API: http://localhost:3001${NC}"
else
    echo -e "${YELLOW}⚠️  Some services are not running. Run ./start.sh to start all services.${NC}"
fi
