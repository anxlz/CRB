# Step-by-Step: Deploy Discord Bot to Google Cloud (24/7)

Follow these exact steps to deploy your COD Mobile Discord bot to Google Cloud Platform.

---

## 🔧 STEP 1: Install Google Cloud SDK

### Windows:
1. Download the installer: https://cloud.google.com/sdk/docs/install#windows
2. Run the installer
3. Follow the prompts and check "Run 'gcloud init'" at the end
4. Restart your terminal/command prompt

### Mac:
```bash
# Download and install
curl https://sdk.cloud.google.com | bash

# Restart terminal, then:
gcloud init
```

### Linux:
```bash
# Download and install
curl https://sdk.cloud.google.com | bash

# Restart terminal, then:
gcloud init
```

---

## 🔑 STEP 2: Set Up Google Cloud Project

1. **Go to Google Cloud Console**: https://console.cloud.google.com/

2. **Create a new project** (or select existing):
   - Click the project dropdown at the top
   - Click "New Project"
   - Name it (e.g., "discord-bot-project")
   - Click "Create"
   - **Write down your PROJECT_ID** (you'll need this)

3. **Enable billing**:
   - Go to: https://console.cloud.google.com/billing
   - Link a billing account to your project
   - ⚠️ Required even for free tier

---

## 🔐 STEP 3: Create Service Account for Google Cloud APIs

1. **Go to IAM & Admin → Service Accounts**:
   https://console.cloud.google.com/iam-admin/serviceaccounts

2. **Create Service Account**:
   - Click "Create Service Account"
   - Name: `discord-bot-service`
   - Click "Create and Continue"

3. **Grant Permissions**:
   - Role: Select "Cloud Vision API User" (or any other APIs you need)
   - Click "Continue"
   - Click "Done"

4. **Create JSON Key**:
   - Click on the service account you just created
   - Go to "Keys" tab
   - Click "Add Key" → "Create New Key"
   - Choose "JSON"
   - Click "Create"
   - **Save the downloaded JSON file** (you'll need it)

---

## 💻 STEP 4: Download Your Bot Code

### Option A: Download from Replit (Easiest)
1. In Replit, click the three dots menu (⋮) next to "Files"
2. Click "Download as zip"
3. Extract the zip file to a folder on your computer

### Option B: Use Git (if you have a repo)
```bash
git clone <your-repo-url>
cd <your-repo-folder>
```

---

## 🚀 STEP 5: Deploy to Google Cloud

Open a terminal in your bot's folder, then choose **ONE** option:

### **OPTION A: Cloud Run Deployment** (Recommended)

#### Step 5A.1: Authenticate
```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```
(Replace `YOUR_PROJECT_ID` with your actual project ID from Step 2)

#### Step 5A.2: Enable Required APIs
```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable secretmanager.googleapis.com
```

#### Step 5A.3: Create Secrets
```bash
# Create Discord token secret
echo -n "YOUR_DISCORD_TOKEN_HERE" | gcloud secrets create DISCORD_TOKEN --data-file=-

# Create Google credentials secret
gcloud secrets create GOOGLE_APPLICATION_CREDENTIALS --data-file=path/to/your-service-account.json
```
(Replace with your actual Discord token and path to the JSON file from Step 3)

#### Step 5A.4: Build the Docker Image
```bash
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/cod-mobile-bot
```

#### Step 5A.5: Deploy to Cloud Run
```bash
gcloud run deploy cod-mobile-bot \
  --image gcr.io/YOUR_PROJECT_ID/cod-mobile-bot \
  --platform managed \
  --region us-central1 \
  --min-instances 1 \
  --max-instances 1 \
  --port 3000 \
  --set-env-vars NODE_ENV=production \
  --set-secrets=DISCORD_TOKEN=DISCORD_TOKEN:latest,GOOGLE_APPLICATION_CREDENTIALS=GOOGLE_APPLICATION_CREDENTIALS:latest \
  --allow-unauthenticated
```

**✅ Done! Your bot is now running 24/7 on Cloud Run**

---

### **OPTION B: Compute Engine Deployment** (Cheaper - $5-7/month)

#### Step 5B.1: Authenticate
```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

#### Step 5B.2: Create VM Instance
```bash
gcloud compute instances create cod-mobile-bot \
  --zone=us-central1-a \
  --machine-type=e2-micro \
  --boot-disk-size=10GB \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --tags=discord-bot
```

#### Step 5B.3: SSH into the VM
```bash
gcloud compute ssh cod-mobile-bot --zone=us-central1-a
```

#### Step 5B.4: Install Node.js on the VM
```bash
# Update system
sudo apt-get update

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install build tools (needed for canvas)
sudo apt-get install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
```

#### Step 5B.5: Upload Your Bot Code
Open a **NEW terminal** on your local machine (don't close the SSH session):
```bash
gcloud compute scp --recurse ./* cod-mobile-bot:~/bot --zone=us-central1-a
```

#### Step 5B.6: Back in the SSH session, set up the bot:
```bash
cd ~/bot

# Install dependencies
npm install --production

# Set environment variables
echo 'export DISCORD_TOKEN="YOUR_DISCORD_TOKEN_HERE"' >> ~/.bashrc
echo 'export GOOGLE_APPLICATION_CREDENTIALS="$HOME/bot/service-account.json"' >> ~/.bashrc
source ~/.bashrc
```

#### Step 5B.7: Upload your Google credentials
On your local machine:
```bash
gcloud compute scp path/to/your-service-account.json cod-mobile-bot:~/bot/service-account.json --zone=us-central1-a
```

#### Step 5B.8: Create a systemd service (keeps bot running 24/7)
Back in SSH:
```bash
sudo tee /etc/systemd/system/discord-bot.service > /dev/null <<EOF
[Unit]
Description=COD Mobile Discord Bot
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$HOME/bot
Environment="DISCORD_TOKEN=$DISCORD_TOKEN"
Environment="GOOGLE_APPLICATION_CREDENTIALS=$HOME/bot/service-account.json"
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
```

#### Step 5B.9: Start the bot service
```bash
sudo systemctl daemon-reload
sudo systemctl enable discord-bot
sudo systemctl start discord-bot
```

#### Step 5B.10: Check status
```bash
sudo systemctl status discord-bot
sudo journalctl -u discord-bot -f
```

**✅ Done! Your bot is now running 24/7 on Compute Engine**

---

## 📊 STEP 6: Monitor Your Bot

### View Logs (Cloud Run):
```bash
gcloud run services logs tail cod-mobile-bot --region=us-central1
```

### View Logs (Compute Engine):
```bash
gcloud compute ssh cod-mobile-bot --zone=us-central1-a
sudo journalctl -u discord-bot -f
```

### Check if bot is online in Discord:
- Go to your Discord server
- Check if your bot shows as "Online"

---

## 🛑 How to Stop/Delete (To Avoid Charges)

### Stop Cloud Run:
```bash
gcloud run services delete cod-mobile-bot --region=us-central1
```

### Stop Compute Engine:
```bash
# Stop (keeps disk, minimal charges)
gcloud compute instances stop cod-mobile-bot --zone=us-central1-a

# Delete (removes everything, no charges)
gcloud compute instances delete cod-mobile-bot --zone=us-central1-a
```

---

## 💰 Cost Breakdown

### Cloud Run (min-instances=1):
- **~$8-15/month** - Always running

### Compute Engine (e2-micro):
- **~$5-7/month** - Always running
- **FREE** if in us-west1, us-central1, or us-east1 (Google free tier - first 744 hours/month)

---

## 🐛 Troubleshooting

### Bot not starting:
```bash
# Check logs
gcloud run services logs tail cod-mobile-bot --region=us-central1

# Or for Compute Engine:
sudo journalctl -u discord-bot -f
```

### "Permission denied" errors:
```bash
# Make sure your service account has the right roles
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:discord-bot-service@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/cloudvision.admin"
```

### Discord token invalid:
- Go to Discord Developer Portal
- Reset your bot token
- Update the secret:
```bash
echo -n "NEW_TOKEN" | gcloud secrets versions add DISCORD_TOKEN --data-file=-
```

---

## ✅ Success Checklist

- [ ] Google Cloud SDK installed
- [ ] Project created and billing enabled
- [ ] Service account created with JSON key downloaded
- [ ] Bot code downloaded from Replit
- [ ] Deployed to Cloud Run OR Compute Engine
- [ ] Bot shows as "Online" in Discord
- [ ] Logs show bot is running without errors

---

**Need help?** Check the logs first, they usually tell you what's wrong!
