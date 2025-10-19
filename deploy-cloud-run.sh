#!/bin/bash

# Configuration - UPDATE THESE VALUES
PROJECT_ID="your-project-id"
REGION="us-central1"
SERVICE_NAME="cod-mobile-bot"

# Set the project
gcloud config set project $PROJECT_ID

# Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable secretmanager.googleapis.com

# Create secrets in Google Secret Manager (if not already created)
echo "Creating secrets in Secret Manager..."
echo "Please enter your Discord token:"
read -s DISCORD_TOKEN
echo "$DISCORD_TOKEN" | gcloud secrets create DISCORD_TOKEN --data-file=- --replication-policy="automatic" 2>/dev/null || \
echo "$DISCORD_TOKEN" | gcloud secrets versions add DISCORD_TOKEN --data-file=-

echo "Please paste your Google Cloud credentials JSON (paste and press Ctrl+D when done):"
cat > /tmp/gcp-creds.json
gcloud secrets create GOOGLE_APPLICATION_CREDENTIALS --data-file=/tmp/gcp-creds.json --replication-policy="automatic" 2>/dev/null || \
gcloud secrets versions add GOOGLE_APPLICATION_CREDENTIALS --data-file=/tmp/gcp-creds.json
rm /tmp/gcp-creds.json

# Build and deploy using Cloud Build
echo "Building and deploying to Cloud Run..."
gcloud builds submit --config=cloudbuild.yaml

echo "✅ Deployment complete!"
echo "Your bot is now running on Google Cloud Run"
echo ""
echo "To view logs:"
echo "gcloud run services logs tail $SERVICE_NAME --region=$REGION"
echo ""
echo "To check status:"
echo "gcloud run services describe $SERVICE_NAME --region=$REGION"
