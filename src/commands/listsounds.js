import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { loadSoundMappings } from '../utils/fileUtils.js';

export const data = new SlashCommandBuilder()
  .setName('listsounds')
  .setDescription('List all available sounds')
  .setDefaultMemberPermissions(0);

export async function execute(interaction) {
  try {
    const sounds = await loadSoundMappings();

    if (Object.keys(sounds).length === 0) {
      return await interaction.reply({
        content: '📭 No sounds available. Use `/addsound` to add one!',
        flags: MessageFlags.Ephemeral,
      });
    }

    const soundList = Object.keys(sounds)
      .map((name) => `• \`${name}\``)
      .join('\n');

    await interaction.reply({
      content: `🔊 **Available Sounds**\n\n${soundList}`,
      flags: MessageFlags.Ephemeral,
    });
  } catch (error) {
    console.error('Error listing sounds:', error);
    await interaction.reply({
      content: '❌ Error loading sounds.',
      flags: MessageFlags.Ephemeral,
    });
  }
}
