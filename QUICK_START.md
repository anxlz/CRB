# 🚀 Quick Start - Deploy to Google Cloud in 10 Minutes

## What You Need:
- ✅ Google Cloud account with billing enabled
- ✅ Your Discord bot token
- ✅ Your Google Cloud service account JSON file

---

## 🎯 FASTEST METHOD: Cloud Run (5 Commands)

### 1. Install Google Cloud SDK
**Windows:** Download from https://cloud.google.com/sdk/docs/install#windows  
**Mac/Linux:** 
```bash
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

### 2. Authenticate
```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

### 3. Enable APIs
```bash
gcloud services enable cloudbuild.googleapis.com run.googleapis.com secretmanager.googleapis.com
```

### 4. Create Secrets
```bash
# Discord token
echo -n "YOUR_DISCORD_TOKEN" | gcloud secrets create DISCORD_TOKEN --data-file=-

# Google Cloud credentials
gcloud secrets create GOOGLE_APPLICATION_CREDENTIALS --data-file=path/to/service-account.json
```

### 5. Build and Deploy
```bash
# Build
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/cod-mobile-bot

# Deploy
gcloud run deploy cod-mobile-bot \
  --image gcr.io/YOUR_PROJECT_ID/cod-mobile-bot \
  --platform managed \
  --region us-central1 \
  --min-instances 1 \
  --port 3000 \
  --set-secrets=DISCORD_TOKEN=DISCORD_TOKEN:latest,GOOGLE_APPLICATION_CREDENTIALS=GOOGLE_APPLICATION_CREDENTIALS:latest \
  --allow-unauthenticated
```

**✅ DONE! Bot is live 24/7**

---

## 💰 Cost: ~$8-15/month

## 📊 View Logs:
```bash
gcloud run services logs tail cod-mobile-bot --region=us-central1
```

## 🛑 Stop/Delete:
```bash
gcloud run services delete cod-mobile-bot --region=us-central1
```

---

## 📁 Files to Download from Replit:
1. Click three dots (⋮) next to "Files" 
2. "Download as zip"
3. Extract on your computer
4. Open terminal in that folder
5. Run the commands above

---

**Need detailed steps?** See `DEPLOY_STEP_BY_STEP.md`
