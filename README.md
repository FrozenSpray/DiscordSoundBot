# Discord Sound Bot

A Discord bot for playing local .mp3 sound files through commands.

## Features

- **Add Sounds**: Upload .mp3 files and create commands to play them
- **Play Sounds**: Join the user's voice channel and play the requested sound
- **Remove Sounds**: Delete sounds and their associated commands
- **Local Hosting**: Simple file-based storage without database requirements

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Create Environment File**
   Create a `.env` file in the root directory:
   ```
   DISCORD_TOKEN=your_bot_token_here
   CLIENT_ID=your_client_id_here
   ```

3. **Directory Structure**
   The bot will create the following directories automatically:
   - `sounds/` - Stores all uploaded .mp3 files
   - `data/` - Stores sound mappings

4. **Run the Bot**
   ```bash
   npm start
   ```
   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

## Commands

- `/addsound <name>` - Add a new sound (attach .mp3 file)
- `/playsound <name>` - Play a sound in your voice channel
- `/removesound <name>` - Remove a sound
- `/listsounds` - List all available sounds

## Requirements

- Node.js 16+
- A Discord bot token (create at [Discord Developer Portal](https://discord.com/developers/applications))
- FFmpeg installed on your system (for audio playback)

## Installation Notes

On Windows, you may need to install build tools for native modules:
```bash
npm install --global --production windows-build-tools
```

Alternatively, ensure you have Python and Visual Studio Build Tools installed.
