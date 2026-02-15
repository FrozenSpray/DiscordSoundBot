import { Client, GatewayIntentBits, Collection, MessageFlags } from 'discord.js';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

import { registerCommands } from './commands/index.js';
import { handleInteraction } from './handlers/interactionHandler.js';
import { ensureDirectories } from './utils/fileUtils.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();

client.once('clientReady', async () => {
  console.log(`✓ Bot logged in as ${client.user.tag}`);

  // Ensure required directories exist
  await ensureDirectories();

  // Register slash commands
  try {
    const commands = await registerCommands(client);
    console.log(`✓ Registered ${commands.length} commands`);

    // Register commands with Discord
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: commands,
    });

    console.log('✓ Commands synced with Discord');
  } catch (error) {
    console.error('Error registering commands:', error);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  try {
    await handleInteraction(interaction, client);
  } catch (error) {
    console.error('❌ Error handling interaction:', error.message);
    console.error(error.stack);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: `❌ An error occurred: ${error.message}`,
        flags: MessageFlags.Ephemeral,
      });
    } else {
      await interaction.reply({
        content: `❌ An error occurred: ${error.message}`,
        flags: MessageFlags.Ephemeral,
      });
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
