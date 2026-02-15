import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { loadSoundMappings, saveSoundMappings } from '../utils/fileUtils.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SOUNDS_DIR = path.join(dirname(__dirname), '..', 'sounds');

export const data = new SlashCommandBuilder()
  .setName('removesound')
  .setDescription('Remove a sound')
  .setDefaultMemberPermissions(0)
  .addStringOption((option) =>
    option
      .setName('name')
      .setDescription('Name of the sound to remove')
      .setRequired(true)
      .setAutocomplete(true)
  );

export async function execute(interaction) {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  try {
    const soundName = interaction.options.getString('name').toLowerCase();
    const sounds = await loadSoundMappings();

    if (!sounds[soundName]) {
      return await interaction.editReply({
        content: `❌ Sound "\`${soundName}\`" not found.`,
      });
    }

    // Delete the sound file
    const fileName = sounds[soundName];
    const filePath = path.join(SOUNDS_DIR, fileName);

    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.warn(`Warning: Could not delete file ${filePath}:`, error.message);
    }

    // Update mappings
    delete sounds[soundName];
    await saveSoundMappings(sounds);

    await interaction.editReply({
      content: `✅ Sound "\`${soundName}\`" removed successfully.`,
    });
  } catch (error) {
    console.error('Error removing sound:', error);
    await interaction.editReply({
      content: '❌ Error removing sound. Please try again.',
    });
  }
}
