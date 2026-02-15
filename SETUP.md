# Discord Sound Bot - Setup Instructions

## Quick Start

### 1. Create a Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to the "Bot" tab and click "Add Bot"
4. Under "TOKEN", click "Copy" to copy your bot token
5. Save your bot token to use later

### 2. Get Your Client ID

1. In the Developer Portal, go to "OAuth2" → "URL Generator"
2. Select scopes: `bot` and `applications.commands`
3. Select permissions: `View Channels`, `Send Messages`, `Connect`, `Speak`
4. Copy the generated URL and open it in browser to invite the bot to your server
5. Your Client ID is shown in the "General Information" tab of your application

### 3. Configure the Bot

1. Copy `.env.example` to `.env`
   ```bash
   copy .env.example .env
   ```

2. Edit `.env` and add your credentials:
   ```
   DISCORD_TOKEN=your_bot_token_here
   CLIENT_ID=your_client_id_here
   ```

### 4. Install FFmpeg (Optional but Recommended for Better Audio)

The bot can work without FFmpeg, but audio quality is better with it installed.

**Windows - Manual Download:**
1. Download from: https://ffmpeg.org/download.html (click "Windows builds")
2. Download the "full" or "essentials" version as a ZIP
3. Extract the ZIP file (e.g., to `C:\ffmpeg`)
4. Find the executable files inside - they're usually in the root or a `bin` subfolder
5. Copy the full path to where the `.exe` files are located
6. Add to your system PATH:
   - Press `Win + X` → "System"
   - Click "Advanced system settings"
   - Click "Environment Variables" button
   - Under "System variables", select "Path" and click "Edit"
   - Click "New" and paste the path (e.g., `C:\ffmpeg` or `C:\ffmpeg\bin`)
   - Click OK and restart PowerShell

**Windows - Using Scoop (Recommended):**
```powershell
# Install Scoop first (if not installed)
iwr -useb get.scoop.sh | iex

# Then install FFmpeg
scoop install ffmpeg
```

**Verify installation:**
```bash
ffmpeg -version
```

If you see the FFmpeg version, it's correctly installed!

### 5. Run the Bot

```bash
npm start
```

For development with auto-restart on file changes:
```bash
npm run dev
```

## Commands

- **`/addsound <name> <file.mp3>`** - Upload and register a new sound
  - Attach an .mp3 file
  - Provide a command name (letters, numbers, hyphens only)
  
- **`/playsound <name>`** - Play a registered sound
  - You must be in a voice channel
  - Bot will join your channel and play the sound
  
- **`/removesound <name>`** - Remove a registered sound
  - Deletes the sound file and its command mapping
  
- **`/listsounds`** - See all registered sounds

## Project Structure

```
sound-bot/
├── src/
│   ├── index.js                 # Main bot file
│   ├── commands/
│   │   ├── index.js             # Command registration
│   │   ├── addsound.js          # Add sound command
│   │   ├── playsound.js         # Play sound command
│   │   ├── removesound.js       # Remove sound command
│   │   └── listsounds.js        # List sounds command
│   ├── handlers/
│   │   └── interactionHandler.js # Command handling & autocomplete
│   └── utils/
│       ├── fileUtils.js         # File & mapping management
│       └── audioPlayer.js       # Voice channel & audio playback
├── sounds/                       # Stores uploaded .mp3 files (created on first run)
├── data/
│   └── soundMappings.json      # Sound name -> file mapping (created on first run)
├── .env                         # Your credentials (create from .env.example)
├── package.json
└── README.md
```

## Features

✅ **Add Sounds** - Upload .mp3 files and create commands  
✅ **Play Sounds** - Join user's voice channel and play audio  
✅ **Remove Sounds** - Delete sounds and clean up files  
✅ **Autocomplete** - Type-ahead suggestions for sound names  
✅ **Local Hosting** - No database needed, simple file-based storage  
✅ **Error Handling** - Comprehensive error messages and validation  

## Troubleshooting

**"Bot is not responding to commands"**
- Ensure the bot has the `applications.commands` scope
- Check that CLIENT_ID and DISCORD_TOKEN are correct
- Restart the bot after updating the .env file

**"Bot is muted when it joins the voice channel"**
- Check that the bot's **role** has these permissions:
  - ✅ Connect (voice channel)
  - ✅ Speak (voice channel)
  - ✅ Use Voice Activity (optional but recommended)
- Check for **channel-specific permission overwrites**:
  - Right-click voice channel → Edit Channel → Permissions
  - Find your bot's role and remove any `Denied` permissions
- Verify the bot isn't **server-muted**:
  - While bot is in voice channel, check member list for bot
  - Right-click bot user → ensure it's not muted
- Try running `/listsounds` to see if the bot responds to any commands

**"Cannot play sound / Audio not working"**
- FFmpeg is now optional - bot can work without it (with fallback)
- If sound isn't playing but no errors:
  - Verify the .mp3 file is valid
  - Check bot has "Speak" permission in the voice channel (see above)
  - Try a different .mp3 file to test
- Check bot console for connection logs (should show "🎵 Using FFmpeg..." or "Using direct file playback")

**"File not found errors"**
- Ensure the bot directory has write permissions
- The `sounds/` and `data/` directories should be created automatically

**Dependencies installation issues on Windows**
- Run: `npm install --global --production windows-build-tools`
- Or install Python 3 and Visual Studio Build Tools manually

## Notes

- Sound names are case-insensitive but stored in lowercase
- Maximum sound name length: 32 characters
- Only .mp3 files are supported
- The bot must be in a voice channel before playing sounds
- All sounds are stored locally in the `sounds/` folder
- Sound mappings are saved in `data/soundMappings.json`
