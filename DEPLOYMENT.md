# Deploying Agri-Nexus to Google Cloud Run

This guide helps you deploy the full Agri-Nexus stack (Frontend + Backend) to Google Cloud Run.

## Prerequisites

1.  **Google Cloud SDK (gcloud)**: Must be installed and authenticated.
    *   [Download Installer](https://cloud.google.com/sdk/docs/install)
2.  **Google Cloud Project**: You need an active project with billing enabled.

## Quick Start (PowerShell)

We've created an automated script to handle the deployment.

1.  Open PowerShell in the project root.
2.  Login to Google Cloud:
    ```powershell
    gcloud auth login
    ```
3.  Run the deployment script:
    ```powershell
    .\deploy.ps1
    ```
4.  Enter your **Project ID** when prompted.

## Manual Steps

If you prefer to deploy manually:

### 1. Backend
```bash
cd backend
gcloud run deploy agri-backend --source . --region us-central1 --allow-unauthenticated
```
*   Copy the Service URL (e.g., `https://agri-backend-xyz.run.app`)

### 2. Frontend
Building the frontend requires the backend URL for API connections.

```bash
cd frontend
export PROJECT_ID=your-project-id
export BACKEND_URL=https://agri-backend-xyz.run.app
export WS_URL=wss://agri-backend-xyz.run.app

# Build the container image
gcloud builds submit --tag gcr.io/$PROJECT_ID/agri-frontend \
  --build-arg NEXT_PUBLIC_API_URL=$BACKEND_URL \
  --build-arg NEXT_PUBLIC_WS_URL=$WS_URL .

# Deploy the service
gcloud run deploy agri-frontend --image gcr.io/$PROJECT_ID/agri-frontend \
  --region us-central1 --allow-unauthenticated
```
