# Deploy Discord Bot to Google Cloud Platform (24/7)

This guide explains how to deploy your COD Mobile Discord bot to Google Cloud Platform for 24/7 operation.

## Prerequisites

1. **Google Cloud Account** with billing enabled
2. **Google Cloud SDK (gcloud)** installed on your local machine
   - Install from: https://cloud.google.com/sdk/docs/install
3. **Your credentials:**
   - Discord Bot Token
   - Google Cloud Service Account JSON

## Deployment Options

### Option 1: Google Cloud Run (Recommended for Containers)

**Pros:**
- Automated scaling
- Pay-per-use pricing
- Managed infrastructure

**Cons:**
- Needs min instances set to 1 for Discord bot (costs ~$8-15/month)

**Deploy Steps:**

1. **Update configuration:**
   ```bash
   # Edit deploy-cloud-run.sh and set your PROJECT_ID
   nano deploy-cloud-run.sh
   ```

2. **Authenticate with Google Cloud:**
   ```bash
   gcloud auth login
   ```

3. **Run deployment script:**
   ```bash
   ./deploy-cloud-run.sh
   ```

4. **The script will:**
   - Enable required APIs
   - Create secrets for DISCORD_TOKEN and GOOGLE_APPLICATION_CREDENTIALS
   - Build Docker container
   - Deploy to Cloud Run with minimum 1 instance (always on)

### Option 2: Google Compute Engine (Best for Always-On VMs)

**Pros:**
- Full VM control
- Predictable pricing (~$5-7/month for e2-micro)
- Simple setup

**Cons:**
- Manual OS/security updates needed

**Deploy Steps:**

1. **Update configuration:**
   ```bash
   # Edit deploy-compute-engine.sh and set your PROJECT_ID
   nano deploy-compute-engine.sh
   ```

2. **Run deployment script:**
   ```bash
   ./deploy-compute-engine.sh
   ```

3. **SSH into the instance and add your code:**
   ```bash
   gcloud compute ssh cod-mobile-bot --zone=us-central1-a
   
   # On the VM:
   cd /app
   
   # Clone your repo or copy files
   git clone <your-repo-url> .
   # OR upload files using gcloud scp
   
   # Install dependencies
   npm install --production
   
   # Set environment variables
   export DISCORD_TOKEN="your-token-here"
   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
   
   # Start the service
   sudo systemctl restart discord-bot
   ```

## Manual Deployment Using gcloud Commands

### 1. Build and Push Docker Image

```bash
# Set your project
gcloud config set project YOUR_PROJECT_ID

# Enable APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable secretmanager.googleapis.com

# Build the image
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/cod-mobile-bot

# Or build locally and push
docker build -t gcr.io/YOUR_PROJECT_ID/cod-mobile-bot .
docker push gcr.io/YOUR_PROJECT_ID/cod-mobile-bot
```

### 2. Create Secrets

```bash
# Create Discord token secret
echo -n "YOUR_DISCORD_TOKEN" | gcloud secrets create DISCORD_TOKEN --data-file=-

# Create Google credentials secret
gcloud secrets create GOOGLE_APPLICATION_CREDENTIALS --data-file=service-account.json
```

### 3. Deploy to Cloud Run

```bash
gcloud run deploy cod-mobile-bot \
  --image gcr.io/YOUR_PROJECT_ID/cod-mobile-bot \
  --platform managed \
  --region us-central1 \
  --min-instances 1 \
  --max-instances 1 \
  --port 3000 \
  --set-env-vars NODE_ENV=production \
  --set-secrets=DISCORD_TOKEN=DISCORD_TOKEN:latest,GOOGLE_APPLICATION_CREDENTIALS=GOOGLE_APPLICATION_CREDENTIALS:latest
```

## Using Cloud Build Triggers (CI/CD)

You can also set up automatic deployments:

1. **Connect your GitHub/GitLab repository** to Cloud Build
2. **Create a trigger** that uses `cloudbuild.yaml`
3. **Every push to main branch** will automatically deploy

```bash
gcloud builds triggers create github \
  --repo-name=your-repo \
  --repo-owner=your-username \
  --branch-pattern="^main$" \
  --build-config=cloudbuild.yaml
```

## Monitoring and Logs

### View Logs (Cloud Run)
```bash
gcloud run services logs tail cod-mobile-bot --region=us-central1
```

### View Logs (Compute Engine)
```bash
gcloud compute ssh cod-mobile-bot --zone=us-central1-a
sudo journalctl -u discord-bot -f
```

### Check Service Status
```bash
# Cloud Run
gcloud run services describe cod-mobile-bot --region=us-central1

# Compute Engine
gcloud compute instances describe cod-mobile-bot --zone=us-central1-a
```

## Cost Estimates

### Cloud Run (min-instances=1)
- **~$8-15/month** for always-on instance
- Additional costs for requests/CPU usage

### Compute Engine (e2-micro)
- **~$5-7/month** for VM instance
- **Always-on pricing** (744 hours/month)

### Free Tier Options
- **Google Compute Engine:** e2-micro in us-west1/us-central1/us-east1 (free tier)
- **Cloud Run:** 180,000 vCPU-seconds free per month (not enough for 24/7)

## Troubleshooting

### Bot won't connect to Discord
- Check DISCORD_TOKEN secret is set correctly
- Verify the bot has proper intents enabled in Discord Developer Portal

### Google Cloud Vision API errors
- Ensure GOOGLE_APPLICATION_CREDENTIALS is properly set
- Verify service account has Vision API permissions
- Check billing is enabled on your project

### Cloud Run keeps restarting
- Set `--min-instances=1` to keep it always running
- Discord bots need persistent connections

## Security Best Practices

1. **Use Secret Manager** for all credentials (never hardcode)
2. **Enable VPC** for network isolation (optional)
3. **Set up IAM roles** properly for service accounts
4. **Enable Cloud Armor** for DDoS protection (if using Cloud Run)
5. **Regular updates:** Keep dependencies updated

## Additional Resources

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Compute Engine Documentation](https://cloud.google.com/compute/docs)
- [Cloud Build Documentation](https://cloud.google.com/build/docs)
- [Secret Manager Documentation](https://cloud.google.com/secret-manager/docs)
