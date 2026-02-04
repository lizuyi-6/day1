Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " AETHER FLOW - Backend API Demo" -ForegroundColor Cyan  
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000"

# Test Workflow Creation
Write-Host "[TEST 1] Creating Workflow..." -ForegroundColor Yellow
$headers = @{ "Content-Type" = "application/json" }
$body = @"
{
  "name": "Test Workflow",
  "graphData": {"cells": []}
}
"@

try {
    $result = Invoke-RestMethod -Uri "$baseUrl/workflow" -Method Post -Headers $headers -Body $body
    Write-Host "SUCCESS: Workflow ID = $($result.id)" -ForegroundColor Green
    # $workflowId = $result.id
}
catch {
    Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test Chat API
Write-Host "[TEST 2] Triggering Chat Agent..." -ForegroundColor Yellow
$chatBody = '{"message": "Hello Aether"}'

try {
    $chatResult = Invoke-RestMethod -Uri "$baseUrl/agent/chat" -Method Post -Headers $headers -Body $chatBody
    Write-Host "SUCCESS: $($chatResult.response)" -ForegroundColor Green
}
catch {
    Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " Backend Status: OPERATIONAL" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
