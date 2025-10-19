#!/bin/bash

# Configuration
PROJECT_ID="your-project-id"
INSTANCE_NAME="cod-mobile-bot"
ZONE="us-central1-a"
MACHINE_TYPE="e2-micro"

# Create a startup script
cat > startup-script.sh << 'EOF'
#!/bin/bash

# Update system
apt-get update
apt-get install -y curl git build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Clone your repository or copy files
mkdir -p /app
cd /app

# Install dependencies
npm install --production

# Create systemd service
cat > /etc/systemd/system/discord-bot.service << 'SERVICE'
[Unit]
Description=COD Mobile Discord Bot
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/app
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
SERVICE

# Enable and start the service
systemctl daemon-reload
systemctl enable discord-bot
systemctl start discord-bot
EOF

# Create the Compute Engine instance
gcloud compute instances create $INSTANCE_NAME \
  --project=$PROJECT_ID \
  --zone=$ZONE \
  --machine-type=$MACHINE_TYPE \
  --network-interface=network-tier=PREMIUM,subnet=default \
  --metadata-from-file=startup-script=startup-script.sh \
  --scopes=https://www.googleapis.com/auth/cloud-platform \
  --boot-disk-size=10GB \
  --boot-disk-type=pd-standard \
  --tags=discord-bot

echo "Instance created! SSH into it with:"
echo "gcloud compute ssh $INSTANCE_NAME --zone=$ZONE --project=$PROJECT_ID"
