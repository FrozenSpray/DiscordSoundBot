import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { loadSoundMappings, saveSoundMappings } from '../utils/fileUtils.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SOUNDS_DIR = path.join(dirname(__dirname), '..', 'sounds');

export const data = new SlashCommandBuilder()
  .setName('addsound')
  .setDescription('Add a new sound (attach an .mp3 file)')
  .setDefaultMemberPermissions(0)
  .addStringOption((option) =>
    option
      .setName('name')
      .setDescription('Name/command for the sound')
      .setRequired(true)
      .setMinLength(1)
      .setMaxLength(32)
  )
  .addAttachmentOption((option) =>
    option
      .setName('file')
      .setDescription('The .mp3 file to upload')
      .setRequired(true)
  );

export async function execute(interaction) {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  try {
    const soundName = interaction.options.getString('name').toLowerCase();
    const attachment = interaction.options.getAttachment('file');

    // Validate file type
    if (!attachment.name.toLowerCase().endsWith('.mp3')) {
      return await interaction.editReply({
        content: '❌ Only .mp3 files are supported.',
      });
    }

    // Check if sound already exists
    const sounds = await loadSoundMappings();
    if (sounds[soundName]) {
      return await interaction.editReply({
        content: `❌ Sound "\`${soundName}\`" already exists. Use \`/removesound ${soundName}\` first.`,
      });
    }

    // Download the file
    const response = await fetch(attachment.url);
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }

    const buffer = await response.buffer();

    // Save the file
    const fileName = `${soundName}.mp3`;
    const filePath = path.join(SOUNDS_DIR, fileName);

    await fs.writeFile(filePath, buffer);

    // Update mappings
    sounds[soundName] = fileName;
    await saveSoundMappings(sounds);

    await interaction.editReply({
      content: `✅ Sound "\`${soundName}\`" added successfully! Use \`/playsound ${soundName}\` to play it.`,
    });
  } catch (error) {
    console.error('Error adding sound:', error);
    await interaction.editReply({
      content: '❌ Error adding sound. Please try again.',
    });
  }
}
