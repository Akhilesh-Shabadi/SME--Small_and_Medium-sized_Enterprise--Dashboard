@echo off
echo Starting Redis server...

REM Check if Redis is already running
netstat -an | findstr :6379 >nul
if %errorlevel% == 0 (
    echo Redis is already running on port 6379
    pause
    exit /b 0
)

REM Try to start Redis using Docker (if available)
echo Attempting to start Redis using Docker...
docker run -d --name sme-redis -p 6379:6379 redis:7-alpine
if %errorlevel% == 0 (
    echo Redis started successfully using Docker
    echo Container name: sme-redis
    echo Port: 6379
    pause
    exit /b 0
)

REM If Docker is not available, provide instructions
echo Docker is not available or Redis container failed to start.
echo.
echo Please install Redis manually:
echo 1. Download Redis for Windows from: https://github.com/microsoftarchive/redis/releases
echo 2. Or use Docker Desktop: https://www.docker.com/products/docker-desktop
echo 3. Or use WSL2 with Redis: wsl --install -d Ubuntu
echo.
echo Alternative: Set REDIS_ENABLED=false in your .env file to disable Redis
echo.
pause
