# Agri-Nexus Deployment Script
# Deploys Backend and Frontend to Google Cloud Run

$ErrorActionPreference = "Stop"

function Check-Command {
    param($Name)
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        Write-Error "Command '$Name' not found. Please install Google Cloud SDK."
        exit 1
    }
}

Check-Command "gcloud"

# 1. Configuration
Write-Host "🌱 Agri-Nexus Deployment Setup" -ForegroundColor Green
$ProjectId = Read-Host "Enter your Google Cloud Project ID"
$Region = "us-central1"

gcloud config set project $ProjectId

# Enable Services
Write-Host "`n📦 Enabling necessary Google Cloud services..." -ForegroundColor Cyan
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com

# 2. Deploy Backend
Write-Host "`n🚀 Deploying Backend..." -ForegroundColor Cyan
gcloud run deploy agri-backend `
    --source ./backend `
    --region $Region `
    --allow-unauthenticated `
    --format "value(status.url)" > backend_url.txt

$BackendUrl = Get-Content backend_url.txt
Write-Host "✅ Backend deployed at: $BackendUrl" -ForegroundColor Green
$WsUrl = $BackendUrl.Replace("https://", "wss://")

# 3. Deploy Frontend
Write-Host "`n🎨 Deploying Frontend..." -ForegroundColor Cyan
Write-Host "Building container image with API URL: $BackendUrl"

# Submit build to Cloud Build to handle build-args
$ImageName = "gcr.io/$ProjectId/agri-frontend"
gcloud builds submit ./frontend `
    --tag $ImageName `
    --substitutions=_API_URL=$BackendUrl,_WS_URL=$WsUrl `
    --config=frontend/cloudbuild.yaml

# Create simple cloudbuild.yaml on the fly if needed? 
# Actually, gcloud builds submit can take arguments without config if using buildpacks, 
# but we have a Dockerfile. To pass build-args to Dockerfile via gcloud builds:
# gcloud builds submit --tag ... --build-arg ...
# Let's run the command directly without config file for simplicity.

gcloud builds submit ./frontend `
    --tag $ImageName `
    --build-arg NEXT_PUBLIC_API_URL=$BackendUrl `
    --build-arg NEXT_PUBLIC_WS_URL=$WsUrl

# Deploy the image
gcloud run deploy agri-frontend `
    --image $ImageName `
    --region $Region `
    --allow-unauthenticated

Write-Host "`n✨ Deployment Complete!" -ForegroundColor Green
Write-Host "Backend: $BackendUrl"
Write-Host "Frontend: (See URL above)"
