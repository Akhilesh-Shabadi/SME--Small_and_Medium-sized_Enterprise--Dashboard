# PowerShell script to start Redis for SME Dashboard
Write-Host "Starting Redis server..." -ForegroundColor Green

# Check if Redis is already running
$redisRunning = Get-NetTCPConnection -LocalPort 6379 -ErrorAction SilentlyContinue
if ($redisRunning) {
    Write-Host "Redis is already running on port 6379" -ForegroundColor Yellow
    Read-Host "Press Enter to continue"
    exit 0
}

# Try to start Redis using Docker
Write-Host "Attempting to start Redis using Docker..." -ForegroundColor Cyan
try {
    $dockerResult = docker run -d --name sme-redis -p 6379:6379 redis:7-alpine 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Redis started successfully using Docker" -ForegroundColor Green
        Write-Host "Container name: sme-redis" -ForegroundColor Green
        Write-Host "Port: 6379" -ForegroundColor Green
        Write-Host "Container ID: $dockerResult" -ForegroundColor Green
        Read-Host "Press Enter to continue"
        exit 0
    }
} catch {
    Write-Host "Docker command failed: $_" -ForegroundColor Red
}

# If Docker is not available, provide instructions
Write-Host "Docker is not available or Redis container failed to start." -ForegroundColor Red
Write-Host ""
Write-Host "Please install Redis manually:" -ForegroundColor Yellow
Write-Host "1. Download Redis for Windows from: https://github.com/microsoftarchive/redis/releases" -ForegroundColor White
Write-Host "2. Or use Docker Desktop: https://www.docker.com/products/docker-desktop" -ForegroundColor White
Write-Host "3. Or use WSL2 with Redis: wsl --install -d Ubuntu" -ForegroundColor White
Write-Host ""
Write-Host "Alternative: Set REDIS_ENABLED=false in your .env file to disable Redis" -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to continue"
