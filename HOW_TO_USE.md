# 🎮 How to Use Your COD Mobile Tournament Bot

## ✅ Your Bot is Running!

The bot is currently **live and ready** with the name: **AeX Setup#2903**

## 📋 Quick Setup Checklist

### Step 1: Add Bot to Your Discord Server

1. Get your bot's Client ID from [Discord Developer Portal](https://discord.com/developers/applications)
2. Use this invite link (replace `YOUR_CLIENT_ID`):
   ```
   https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=274878221376&scope=bot%20applications.commands
   ```

### Step 2: Configure Setup Channels

In your Discord server, run:
```
/setupchannels #your-channel-name
```

The bot will post a setup embed with a "Join" button!

### Step 3: Players Use the Setup

5 players click through this flow:

1. **🎯 Click "Join"** → System adds you to roster
2. **🔫 Select Roles** → Pick 2 weapon class roles (pool limits enforced)
3. **⚔️ Choose Weapons** → Filtered by your roles
4. **⚡ Pick Operator** → Unique per team (9 available)
5. **💣 Select Equipment** → Lethal + Tactical (3/3 limit per tactical)
6. **🗺️ View Maps** → See competitive map pool
7. **📋 Final Preview** → Complete roster ready!

## 🎯 Competitive Rules Enforced

### Weapon Class Role Pool (Per Team)
- **3x** Assault Rifles (AR)
- **3x** Sub-Machine Guns (SMG)  
- **2x** Heavy (Shotguns & LMGs)
- **2x** Marksman (Snipers & Marksman Rifles)

### Equipment Limits
- **Lethal**: Unlimited
- **Tactical**: Max 3 per type (Trophy/Flash/Smoke)

### Operator Skills
Each must be unique - no duplicates allowed!

## 💡 Commands Reference

| Command | Description |
|---------|------------|
| `/setupchannels <channel>` | Add a channel for setup messages |
| `/resetsetup` | Clear current setup and start fresh |

## 🎨 Custom Emojis

The bot uses text emojis for now. You mentioned wanting custom emojis! Here's what you'll need:

### Weapon Class Roles
- 🔫 AR → Replace with custom AR emoji
- 💨 SMG → Replace with custom SMG emoji
- 💪 Heavy → Replace with custom Heavy emoji
- 🎯 Marksman → Replace with custom Marksman emoji

### Operator Skills
- 💣 War Machine
- ⚔️ Equalizer
- 🔥 Purifier
- 🔫 Death Machine
- 🌀 Gravity Vortex
- 🏹 Sparrow
- 🦅 Claw
- 💥 Annihilator
- ⚡ Tempest

### Equipment
- 💣 Frag Grenade
- 🧲 Sticky Grenade
- 🛡️ Trophy System
- ⚡ Flash Grenade
- 💨 Smoke Grenade

**To add custom emojis:**
1. Upload emojis to your Discord server
2. Update the emoji names in `src/constants/game-data.ts`
3. Replace the text emojis with Discord emoji format: `<:emoji_name:emoji_id>`

## 🛠️ Files Created

- **`README.md`** - Technical documentation
- **`SETUP_GUIDE.md`** - Detailed player guide
- **`HOW_TO_USE.md`** - This quick reference (you are here!)
- **`replit.md`** - Project memory & architecture

## 🚀 Next Steps

1. **Invite bot to your server** using the OAuth2 URL
2. **Run `/setupchannels`** in your tournament channels
3. **Test with 5 players** to verify the complete flow
4. **Add custom emojis** for better visual appeal (optional)
5. **Deploy to production** when ready for tournaments

## 📞 Need Help?

Check `SETUP_GUIDE.md` for detailed troubleshooting and step-by-step instructions for each setup phase.

---

**Your bot is live and ready for COD Mobile tournaments! 🎮**
