# COD Mobile Esports Discord Bot

## Project Overview
A NestJS-based Discord bot for managing Call of Duty Mobile tournament roster setups with weapon class roles, operator skills, and equipment selection following official competitive rules.

## Recent Changes (October 13, 2025)
- Updated initial setup message to display gun roles directly (AR 0/3, SMG 0/3, Heavy 0/2, Marksman 0/2)
- Added 💡 light emoji to Join button text in setup message
- Expanded weapon list with comprehensive competitive meta weapons (filtered out 9 banned weapons: NA-45, SVD, XPR-50, Thumper, Shorty, SMRS, FHJ-18, Argus, D13 Sector)
- Converted operator skills from buttons to select menus (dropdowns) for improved UX
- Converted tactical and lethal equipment from buttons to select menus (dropdowns)
- Added `/setemoji` command: Configure custom emojis for weapon roles, individual guns, operator skills, tactical, and lethal equipment
- Implemented custom emoji display system: All select menus and embeds now show configured emojis alongside item names
- Added validation guards: Prevents selection of placeholder 'none' values in operator and tactical dropdowns when options are exhausted
- Emoji storage: Per-guild emoji configurations stored in memory (resets on bot restart)
- Fixed Discord API error: Limited weapon selection dropdowns to maximum 25 options (Discord's select menu limit)

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
- `/setemoji` - Configure custom emojis for roles, weapons, operators, tactical, and lethal equipment

#### Interactive Flow
1. **Role Selection**: Players choose 2 weapon class roles each (validated against pool limits)
2. **Weapon Selection**: Cascading dropdowns for 2 weapons filtered by assigned roles
3. **Operator Skills**: Select menus (dropdowns) for unique operator selection with custom emoji support
4. **Equipment**: Select menus (dropdowns) for Lethal (unlimited) and Tactical (3 max per type) with custom emoji support
5. **Setup Complete**: Final roster display with "Start New Setup" button (only visible to manager role)

#### Services
- **BotService**: Core business logic for setup management, validation, state tracking, and Discord logging
- **BotUpdate**: Event handlers for bot lifecycle and client setup
- **Interaction Handlers**: Separate handlers for roles, weapons, operators, equipment, and action buttons

### Data Structure
- In-memory storage for active setups, log channels, manager roles, test mode state, and emoji configurations
- Setup state includes: players, role pool, current page, selections, lastQueueTime, status
- Real-time validation for role availability and operator uniqueness
- Logging system sends events to both console and configured Discord channel
- Status tracking: waiting → in_progress → active → completed
- Emoji configurations stored per-guild with support for roles, weapons, operators, tactical, and lethal equipment

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
- **In-Memory State**: Log channel, manager role, test mode settings, and emoji configurations are stored in memory and reset on bot restart
- **Test Mode**: Useful for development - allows 1 player to fill all 5 slots
- **Manager Role Permissions**: Only users with configured manager role can start new setups (if no role set, all users can)
- **Timestamp Tracking**: lastQueueTime updates when first player joins empty setup or after completion
- **Status Indicators**: Visual queue lifecycle tracking with emoji indicators
- **Custom Emojis**: Configured per-guild using `/setemoji` command, displayed in all select menus and embeds

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
