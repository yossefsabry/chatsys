#!/bin/bash

# Kill child processes on script exit
trap 'kill 0' SIGINT

echo -e "\033[1;36m====================================================\033[0m"
echo -e "\033[1;35m             INITIALIZING NEO_CHAT                  \033[0m"
echo -e "\033[1;36m====================================================\033[0m"

echo -e "\n\033[1;32m[SYSTEM] Starting Backend Server (Port 3001)...\033[0m"
cd server
node index.js &
SERVER_PID=$!
cd ..

echo -e "\033[1;32m[SYSTEM] Starting Frontend Client...\033[0m"
cd client
npm run dev &
CLIENT_PID=$!
cd ..

echo -e "\n\033[1;36m====================================================\033[0m"
echo -e "\033[1;32m [SUCCESS] All systems are online!\033[0m"
echo -e "\033[1;36m====================================================\033[0m"
echo -e "\033[1;37m -> App UI: \033[4;36mhttp://localhost:5174\033[0m"
echo -e "\033[1;37m -> API:    \033[4;36mhttp://localhost:3001/api/chats\033[0m"
echo -e "\033[1;33m Press Ctrl+C to shut down all servers.\033[0m"
echo -e "\033[1;36m====================================================\033[0m\n"

# Wait for user interrupt
wait
