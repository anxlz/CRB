# COD Mobile Bot Setup Guide

## Quick Start

Your Discord bot is now running! Here's how to use it:

## 1. Invite Bot to Your Server

Use this URL format (replace YOUR_CLIENT_ID with your bot's client ID from Discord Developer Portal):

```
https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=274878221376&scope=bot%20applications.commands
```

**To find your Client ID:**
1. Go to https://discord.com/developers/applications
2. Select your application
3. Click "OAuth2" in the left sidebar
4. Copy the "Client ID"

## 2. Configure Setup Channels

Once the bot is in your server:

1. Run the slash command: `/setupchannels`
2. Select the channel where you want roster setup messages
3. The bot will automatically post a setup embed in that channel

You can add multiple channels by running `/setupchannels` multiple times with different channels.

## 3. Using the Roster Setup

### Players Join (5 Required)
1. Players click the green **"Join"** button
2. Up to 5 players can join
3. Setup won't progress until all 5 players are in

### Step 1: Weapon Class Roles
- Each player selects **2 different weapon class roles** from dropdowns
- Pool limits are enforced:
  - 🔫 Assault Rifles: 3/3 available
  - 💨 Sub-Machine Guns: 3/3 available
  - 💪 Heavy: 2/2 available
  - 🎯 Marksman: 2/2 available
- If a role pool is full, you'll get an error message
- Once all 5 players select roles, automatically moves to weapons

### Step 2: Weapon Selection
- Dropdown shows only weapons matching your assigned roles
- Select any weapons from your available pool
- Example: If you have AR/SMG, you'll see M13, DR-H, USS9, Fennec, etc.
- Moves to operators when all 5 players select weapons

### Step 3: Operator Skills
- Click a button to select your operator skill
- Each operator can only be chosen once per team
- Taken operators are grayed out and show who picked them
- Available operators:
  - 💣 War Machine
  - ⚔️ Equalizer
  - 🔥 Purifier
  - 🔫 Death Machine
  - 🌀 Gravity Vortex
  - 🏹 Sparrow
  - 🦅 Claw
  - 💥 Annihilator
  - ⚡ Tempest

### Step 4: Lethal & Tactical Equipment
- **Lethal (Green buttons)**: No limit
  - 💣 Frag Grenade
  - 🧲 Sticky Grenade
- **Tactical (Blue/Gray buttons)**: Max 3 per type
  - 🛡️ Trophy System (3/3 max)
  - ⚡ Flash Grenade (3/3 max)
  - 💨 Smoke Grenade (3/3 max)
- Buttons disable when tactical limit is reached

### Step 5: Map Voting
- View the competitive map pool by game mode
- Map voting functionality coming soon!
- Click **"View Setup"** to see final roster

### Step 6: Final Preview
- Complete roster configuration is displayed
- Shows all players with their:
  - Weapon class roles
  - Selected weapons
  - Operator skill
  - Lethal and tactical equipment
- Click **"Start New Setup"** to reset and begin again

## Available Commands

### `/setupchannels <channel>`
Configure channels where setup messages appear. Can be used multiple times for different channels.

### `/resetsetup`
Reset the current roster setup in the channel where you run this command. Useful if setup gets stuck or you want to start over.

## Action Buttons

- **✅ Join**: Join the roster setup (max 5 players)
- **✏️ Edit**: Update your current selection on any page
- **❌ Leave**: Leave the setup (frees up your spot and releases your role pool selections)
- **🔄 Start New Setup**: Reset everything and begin a fresh roster setup

## Troubleshooting

### "Role pool is full"
- Someone else already used the maximum allowed roles for that class
- Ask teammates to Edit their roles to free up space
- Or the player can Leave and rejoin with different roles

### "Operator already taken"
- Each operator can only be selected once per team
- Choose a different operator (available ones are not grayed out)

### Bot not responding
- Make sure the bot has proper permissions in your server
- Check that Message Content Intent is enabled in Discord Developer Portal
- Restart the bot workflow in Replit if needed

### Setup stuck
- Use `/resetsetup` to clear the current setup
- All players will need to rejoin and select again

## Competitive Weapons Reference

### 🔫 Assault Rifles (AR)
M13, DR-H, HVK-30, Vargo-S, BP50

### 💨 Sub-Machine Guns (SMG)
USS9, Fennec, CX-9, QQ9

### 💪 Heavy (Shotguns & LMGs)
Holger 26, MG42, Chopper, HS0405, R9-0, KRM-262

### 🎯 Marksman (Snipers & Marksman Rifles)
Type 63, SKS, Tundra, DL Q33

## Tips for Tournament Organizers

1. Create dedicated setup channels for each match
2. Use `/setupchannels` once per match channel
3. Players complete setup before match starts
4. Use `/resetsetup` between series if using same channel
5. Take screenshots of final preview for official records

---

**Need help?** Check the README.md for more technical details or contact your bot administrator.
