# COD Mobile Esports Discord Bot

## Project Overview
A NestJS-based Discord bot for managing Call of Duty Mobile tournament roster setups with weapon class roles, operator skills, and equipment selection following official competitive rules.

## Recent Changes (October 14, 2025 - Latest)
- **Fixed Discord API 100-Character Limits**: Resolved errors with autocomplete and select menu options
  - `/setgunsmenu` autocomplete now uses short identifiers (e.g., "AR_LIST_1") instead of full weapon lists to stay under 100-char limit
  - Command automatically resolves identifiers back to full weapon lists when processing
  - Added label truncation across all select menus (weapons, operators, equipment) to prevent emoji+name combinations from exceeding 100 chars
  - Descriptions in select menus also truncated to respect Discord's limits
- **Improved `/setgunsmenu` Autocomplete UX**: All list fields now show ALL available weapon lists for the selected category
  - Instead of list1 showing only "List 1", list2 showing only "List 2", etc.
  - Now ANY list field shows all available lists (e.g., AR shows 2 lists, SMG shows 2 lists, Sniper shows 1 list)
  - Users can select the same list multiple times or combine different lists as needed
- **Auto-populated Weapon Lists**: Created weapon database from COD Mobile weapons file with automatic parsing and categorization
  - Parses 34 Assault Rifles, 29 SMGs, 11 Snipers, 13 LMGs, 10 Shotguns, 7 Marksman Rifles, 9 Pistols
  - Automatically removes banned weapons (NA-45, SVD, XPR-50, Argus, Shorty) and season info from weapon names
  - Splits weapons into chunks of 24 per list (e.g., AR has 2 lists: 24 guns + 10 guns)
- **Enhanced `/setgunsmenu` Autocomplete**: List parameters now show pre-filled weapon options from database
  - When you select a category, list1/list2/list3 autocomplete shows actual gun lists
  - Shows gun count and preview for each list (e.g., "AR - List 1 (24 guns)")
  - No manual typing needed - just select from autocomplete options
- **Streamlined Role Selection UX**: Replaced Join button with role selection dropdown directly on main setup message - all users can now see and use the dropdown without clicking Join first
- **Operator Skills Dropdown**: Converted operator skills from buttons to select menu (dropdown) for cleaner UI
- **Fixed Operator Selection**: Moved interaction reply to end of handler to prevent "This interaction failed" error
- **Bot Streaming Status**: Bot now displays streaming status "COD Mobile Roster" when online
- **Updated Queue Timestamp Label**: Changed "Last Queue" to "Last Queue Date" across all embeds for clarity

## Recent Changes (October 13, 2025)
- **Updated `/setgunsmenu` Command**: Changed to accept multiple list parameters (list1-list24) with comma-separated guns instead of individual gun options
  - Supports up to 24 lists + 1 category = 25 total options (Discord's limit)
  - Creates **multi-select menu** allowing users to choose multiple guns at once
  - Pre-configured gun lists available for all weapon categories (AR, SMG, SNIPER, LMG, SHOTGUN, MARKSMAN, PISTOL)
  - See `GUN_LISTS_REFERENCE.md` for complete gun lists organized by category
  - Automatically filters banned weapons: NA-45, SVD, XPR-50, XPR, Thumper, Shorty, SMRS, FHJ-18, Argus, D13 Sector
- **Enhanced Weapon Selection UX**: Updated weapon selection to show "1st Weapon (role)" and "2nd Weapon (role)" format, clearly indicating which weapon position and role is being selected
- **Redesigned Initial Setup Page**: First page now displays role selection dropdown with Join, Leave, and Edit buttons, removing the previous setup flow description
- **Added 💡 Help Button**: Introduced a light bulb emoji button that shows setup steps when clicked (instead of displaying steps on initial page)
- **Improved Role Display**: Role combinations now display in **bold** with user mentions underneath and separator lines (─────) for better visual organization
- **Consistent UI Components**: All setup embeds (setupchannels, sendsetup, resetsetup, bot startup, new setup) now consistently show role dropdown, Join/Leave/Edit buttons, and 💡 button

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
- `/setgunsmenu` - Create custom gun menus with auto-populated weapon lists from database (multi-select enabled, autocomplete with pre-filled guns)

#### Interactive Flow
1. **Initial Page**: Displays gun roles publicly (AR 0/3, SMG 0/3, etc.) with role selection dropdown, Leave, Edit buttons and 💡 help button
2. **Role Selection**: Players choose 2 weapon class roles each from the dropdown (validated against pool limits) with bold display and user mentions
3. **Weapon Selection**: Cascading dropdowns showing "1st Weapon (role)" and "2nd Weapon (role)" for clear selection
4. **Operator Skills**: Select menus (dropdowns) for unique operator selection with custom emoji support
5. **Equipment**: Select menus (dropdowns) for Lethal (unlimited) and Tactical (3 max per type) with custom emoji support
6. **Setup Complete**: Final roster display with "Start New Setup" button (only visible to manager role)

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
- **Timestamp Tracking**: Last Queue Date updates when first player joins empty setup or after completion
- **Status Indicators**: Visual queue lifecycle tracking with emoji indicators
- **Custom Emojis**: Configured per-guild using `/setemoji` command, displayed in all select menus and embeds
- **Bot Status**: Bot displays streaming status "COD Mobile Roster" when online
- **Autocomplete**: Category parameter in `/setgunsmenu` command has autocomplete for easier selection

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
