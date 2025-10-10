# COD Mobile Esports Discord Bot

## Project Overview
A NestJS-based Discord bot for managing Call of Duty Mobile tournament roster setups with weapon class roles, operator skills, and equipment selection following official competitive rules.

## Recent Changes (October 10, 2025)
- Initial project setup with NestJS and Necord
- Implemented interactive roster setup flow with 5-player progression
- Added weapon class role selection with pool validation
- Created operator skills and equipment selection pages
- Integrated competitive map pool display
- Added /setupchannels and /resetsetup commands
- Bot successfully deployed and running

## Project Architecture

### Tech Stack
- **Backend Framework**: NestJS (Node.js framework)
- **Discord Library**: Necord (Discord.js wrapper for NestJS)
- **Language**: TypeScript
- **Discord.js**: v14

### Key Components

#### Commands
- `/setupchannels` - Configure setup message channels
- `/resetsetup` - Reset current roster setup

#### Interactive Flow
1. **Role Selection Page**: 5 players choose 2 weapon class roles each (validated against pool limits)
2. **Weapon Selection**: Dropdown filtered by assigned roles
3. **Operator Skills**: Buttons for unique operator selection
4. **Equipment**: Lethal (unlimited) and Tactical (3 max per type)
5. **Map Voting**: Display competitive map pool
6. **Final Preview**: Complete roster configuration

#### Services
- **BotService**: Core business logic for setup management, validation, and state tracking
- **BotUpdate**: Event handlers for bot lifecycle
- **Interaction Handlers**: Separate handlers for roles, weapons, operators, equipment, maps, and action buttons

### Data Structure
- In-memory storage for active setups
- Setup state includes: players, role pool, current page, selections
- Real-time validation for role availability and operator uniqueness

### Competitive Rules Implementation
- **Role Pool**: 3 ARs, 3 SMGs, 2 Heavy, 2 Marksman per team
- **Weapons**: Filtered by assigned roles (competitive meta weapons)
- **Operators**: 9 unique skills, one per player
- **Equipment**: Tactical limit (3/3 per type), unlimited lethal

## Environment Variables
- `DISCORD_BOT_TOKEN` - Discord bot authentication token

## Workflow
- **Name**: COD Mobile Bot
- **Command**: `npm run start`
- **Output**: Console (backend bot)

## Future Enhancements
- Map voting functionality (currently displays pool only)
- Persistent storage with database
- Admin override capabilities
- Team registration system
- Match reporting and statistics
- Tournament bracket management

## User Preferences
- All embeds use color: #8943F9
- Emoji-enhanced UI for better visual feedback
- Interactive buttons and dropdowns for selections
- Real-time validation and error messages
