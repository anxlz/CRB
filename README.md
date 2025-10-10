# COD Mobile Esports Discord Bot

A Discord bot built with NestJS and Necord for managing Call of Duty Mobile tournament roster setups with weapon class roles, operator skills, and equipment selection.

## Features

- **Interactive Roster Setup Flow**: Step-by-step guided setup for 5-player teams
- **Weapon Class Role Management**: Enforces competitive pool limits (3 ARs, 3 SMGs, 2 Heavy, 2 Marksman)
- **Competitive Weapon Pool**: Pre-configured with current meta weapons
- **Operator Skills Selection**: Unique operator per player enforcement
- **Equipment Configuration**: Lethal and tactical equipment with limits
- **Map Voting**: Display of competitive map pool by game mode
- **Real-time Validation**: Prevents invalid selections and enforces tournament rules

## Setup Flow

1. **Weapon Class Roles** - Each player selects 2 different weapon class roles
2. **Weapons** - Choose weapons based on assigned roles
3. **Operator Skills** - Select unique operator (one per team)
4. **Lethal & Tactical** - Pick equipment (3 max per tactical type)
5. **Maps** - View competitive map pool
6. **Final Preview** - Review complete roster configuration

## Commands

- `/setupchannels <channel>` - Configure channels for setup messages
- `/resetsetup` - Reset current roster setup

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Discord Bot:**
   - Create a bot at [Discord Developer Portal](https://discord.com/developers/applications)
   - Enable intents: Guilds, Guild Messages, Message Content
   - Add bot permissions: Send Messages, Embed Links, Use Slash Commands, Manage Messages
   - Add DISCORD_BOT_TOKEN to environment variables

3. **Run the bot:**
   ```bash
   npm start
   ```

## Bot Usage

1. Use `/setupchannels` to designate roster setup channels
2. Bot automatically sends setup embed when started
3. Players click "Join" to start the setup process
4. Follow the interactive flow through all setup pages
5. View final roster preview when complete

## Competitive Rules

### Weapon Class Roles
- **Assault Rifles (AR)**: M13, DR-H, HVK-30, Vargo-S, BP50
- **Sub-Machine Guns (SMG)**: USS9, Fennec, CX-9, QQ9
- **Heavy**: Holger 26, MG42, Chopper, HS0405, R9-0, KRM-262
- **Marksman**: Type 63, SKS, Tundra, DL Q33

### Role Pool Limits
- 3 AR roles per team
- 3 SMG roles per team
- 2 Heavy roles per team
- 2 Marksman roles per team

### Operator Skills
War Machine, Equalizer, Purifier, Death Machine, Gravity Vortex, Sparrow, Claw, Annihilator, Tempest

### Equipment
- **Lethal**: Frag Grenade, Sticky Grenade (unlimited)
- **Tactical**: Trophy System, Flash Grenade, Smoke Grenade (max 3 per type)

## Tech Stack

- **NestJS** - Progressive Node.js framework
- **Necord** - Discord.js wrapper for NestJS
- **Discord.js v14** - Discord API library
- **TypeScript** - Type-safe development

## Project Structure

```
src/
├── bot/
│   ├── commands/          # Slash commands
│   ├── interactions/      # Button & dropdown handlers
│   ├── bot.service.ts     # Business logic
│   ├── bot.update.ts      # Event handlers
│   └── bot.module.ts      # Module configuration
├── constants/
│   └── game-data.ts       # Game data & configurations
├── app.module.ts          # Root module
└── main.ts               # Entry point
```

## License

ISC
