import { SlashCommandBuilder, ChannelType, MessageFlags } from 'discord.js';
import { loadSoundMappings } from '../utils/fileUtils.js';
import { playSound } from '../utils/audioPlayer.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SOUNDS_DIR = path.join(dirname(__dirname), '..', 'sounds');

export const data = new SlashCommandBuilder()
  .setName('playsound')
  .setDescription('Play a sound in your voice channel')
  .setDefaultMemberPermissions(0)
  .addStringOption((option) =>
    option
      .setName('name')
      .setDescription('Name of the sound to play')
      .setRequired(true)
      .setAutocomplete(true)
  );

export async function execute(interaction) {
  console.log('📽️ playsound command started');
  
  // Defer immediately to acknowledge the interaction
  try {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    console.log('✅ Reply deferred (acknowledged to Discord)');
  } catch (error) {
    console.error('❌ Failed to defer reply:', error.message);
    return;
  }

  try {
    console.log('📋 Getting sound name...');
    const soundName = interaction.options.getString('name').toLowerCase();
    console.log(`🔍 Sound name: ${soundName}`);
    
    console.log('📂 Loading sound mappings...');
    const sounds = await loadSoundMappings();
    console.log(`📂 Loaded sounds: ${Object.keys(sounds).join(', ')}`);

    if (!sounds[soundName]) {
      return await interaction.editReply({
        content: `❌ Sound "\`${soundName}\`" not found. Use \`/listsounds\` to see available sounds.`,
      });
    }

    // Check if user is in a voice channel
    console.log('🎤 Checking voice channel...');
    const voiceChannel = interaction.member?.voice.channel;
    if (!voiceChannel) {
      return await interaction.editReply({
        content: '❌ You must be in a voice channel to play sounds.',
      });
    }
    console.log(`✅ User in channel: ${voiceChannel.name}`);

    // Check bot permissions
    console.log('🔐 Checking bot permissions...');
    const botMember = interaction.guild.members.me;
    const botPermissions = voiceChannel.permissionsFor(botMember);
    
    console.log(`📋 Bot permissions in channel: ${voiceChannel.name}`);
    console.log(`  - Connect: ${botPermissions.has('Connect')}`);
    console.log(`  - Speak: ${botPermissions.has('Speak')}`);
    console.log(`  - UseVAD: ${botPermissions.has('UseVAD')}`);
    console.log(`  - ViewChannel: ${botPermissions.has('ViewChannel')}`);
    
    if (!botPermissions.has('Connect')) {
      return await interaction.editReply({
        content: '❌ I don\'t have permission to **Connect** to your voice channel. Please check channel permissions.',
      });
    }

    if (!botPermissions.has('Speak')) {
      return await interaction.editReply({
        content: `❌ I don\'t have permission to **Speak** in your voice channel. Current permissions: ${botPermissions.toArray().join(', ') || 'None'}`,
      });
    }
    console.log('✅ Permissions verified - Connect and Speak allowed');

    // Edit the deferred reply to indicate playback is starting
    await interaction.editReply({
      content: `🎵 Now playing "\`${soundName}\`"...`,
    });
    console.log('✅ Response sent');

    // Play sound asynchronously in background
    const soundFile = sounds[soundName];
    const filePath = path.join(SOUNDS_DIR, soundFile);
    console.log(`📁 File path: ${filePath}`);
    
    playSound(voiceChannel, filePath).catch((error) => {
      console.error('❌ Error during async playback:', error.message);
    });

  } catch (error) {
    console.error('❌ Error in playsound:', error.message);
    console.error(error.stack);
    try {
      await interaction.editReply({
        content: `❌ Error: ${error.message}`,
      });
    } catch (replyError) {
      console.error('❌ Could not send error reply:', replyError.message);
    }
  }
}
