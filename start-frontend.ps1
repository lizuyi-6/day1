Write-Host "===============================================" -ForegroundColor Cyan
Write-Host " Aether Flow Frontend (Node 18 + Vite 5)" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

nvm use 18.20.8
Write-Host ""
Write-Host "Starting development server..." -ForegroundColor Yellow
Write-Host "URL: http://localhost:5173" -ForegroundColor Green
Write-Host ""

cd frontend
npm run dev
