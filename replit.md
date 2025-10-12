# COD Mobile Esports Discord Bot

## Project Overview
A NestJS-based Discord bot for managing Call of Duty Mobile tournament roster setups with weapon class roles, operator skills, and equipment selection following official competitive rules.

## Recent Changes (October 12, 2025)
- Streamlined roster setup flow: Role selection is now the first and only page (removed preview page and map voting)
- Added dual weapon selection system: Players now select 2 weapons with cascading dropdowns
- Added streaming status indicators: Shows queue lifecycle (⏳ Waiting → 🔄 In Progress → ✅ Active → ✔️ COMPLETED)
- Added lastQueueTime tracking: Timestamp updates when new queue starts and displays consistently across all embeds
- Added `/sendsetup` command: Manually broadcast setup messages to specified channels
- Added `/setmanagerrole` command: Configure role required to start new setups (permissions system)
- Modified `/playerprofile` command: User parameter now optional, defaults to command author
- Modified `/setupchannels` command: Now accepts up to 5 channels simultaneously
- Added `/setlogchannel` command: Configure Discord channel for roster event logging
- Added `/testmode` command: Enable test mode where 1 player counts as 5 (for testing)
- Implemented comprehensive logging system: All roster events (join/leave/selections) log to console and configured Discord channel
- Implemented role-based permissions: "Start New Setup" button only visible to users with manager role
- Changed "Anxiety Rank 5 Queue" to "Roster Setup" throughout
- Simplified button labels: "Join Queue" → "Join", "Leave Queue" → "Leave"
- Installed canvas library with system dependencies for image generation

## Project Architecture

### Tech Stack
- **Backend Framework**: NestJS (Node.js framework)
- **Discord Library**: Necord (Discord.js wrapper for NestJS)
- **Language**: TypeScript
- **Discord.js**: v14
- **Image Generation**: Canvas

### Key Components

#### Commands
- `/setupchannels` - Configure setup message channels (up to 5 at once)
- `/resetsetup` - Reset current roster setup
- `/setlogchannel` - Set channel for roster event logs
- `/setmanagerrole` - Set role required to start new setups
- `/sendsetup` - Manually send setup message to specified channel
- `/testmode` - Toggle test mode (1 player = 5 players)
- `/playerprofile` - Display player profile with stats image (defaults to author)

#### Interactive Flow
1. **Role Selection**: Players choose 2 weapon class roles each (validated against pool limits)
2. **Weapon Selection**: Cascading dropdowns for 2 weapons filtered by assigned roles
3. **Operator Skills**: Buttons for unique operator selection
4. **Equipment**: Lethal (unlimited) and Tactical (3 max per type)
5. **Setup Complete**: Final roster display with "Start New Setup" button (only visible to manager role)

#### Services
- **BotService**: Core business logic for setup management, validation, state tracking, and Discord logging
- **BotUpdate**: Event handlers for bot lifecycle and client setup
- **Interaction Handlers**: Separate handlers for roles, weapons, operators, equipment, and action buttons

### Data Structure
- In-memory storage for active setups, log channels, manager roles, and test mode state
- Setup state includes: players, role pool, current page, selections, lastQueueTime, status
- Real-time validation for role availability and operator uniqueness
- Logging system sends events to both console and configured Discord channel
- Status tracking: waiting → in_progress → active → completed

### Competitive Rules Implementation
- **Role Pool**: 3 ARs, 3 SMGs, 2 Heavy, 2 Marksman per team
- **Weapons**: Filtered by assigned roles (competitive meta weapons)
- **Operators**: 9 unique skills, one per player
- **Equipment**: Tactical limit (3/3 per type), unlimited lethal

### Logging System
- All roster events logged with structured JSON data
- Logs sent to console and configured Discord channel (if set)
- Event types: PLAYER JOINED, PLAYER LEFT, ROLE SELECTED, WEAPON SELECTED, OPERATOR SELECTED, LETHAL SELECTED, TACTICAL SELECTED, ROSTER COMPLETE
- Discord logs use purple embeds with formatted JSON

## Environment Variables
- `DISCORD_BOT_TOKEN` - Discord bot authentication token

## Workflow
- **Name**: COD Mobile Bot
- **Command**: `npm run start`
- **Output**: Console (backend bot)

## Important Notes
- **In-Memory State**: Log channel, manager role, and test mode settings are stored in memory and reset on bot restart
- **Test Mode**: Useful for development - allows 1 player to fill all 5 slots
- **Manager Role Permissions**: Only users with configured manager role can start new setups (if no role set, all users can)
- **Timestamp Tracking**: lastQueueTime updates when first player joins empty setup or after completion
- **Status Indicators**: Visual queue lifecycle tracking with emoji indicators

## Future Enhancements
- Persistent storage with database for settings
- Admin override capabilities
- Team registration system
- Match reporting and statistics
- Tournament bracket management

## User Preferences
- All embeds use color: #8943F9
- Clean text-only UI without emojis
- Interactive buttons and dropdowns for selections
- Real-time validation and error messages
- Comprehensive logging of all roster events
