import { createAudioPlayer, createAudioResource, joinVoiceChannel, VoiceConnectionStatus, AudioPlayerStatus, entersState } from '@discordjs/voice';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const execAsync = promisify(exec);
const activeConnections = new Map();

export async function playSound(voiceChannel, filePath) {
  try {
    // Check if FFmpeg is available
    const ffmpegAvailable = await checkFFmpeg();
    
    // Check if already connected to THIS SPECIFIC channel
    let connection = activeConnections.get(voiceChannel.guild.id);
    const isConnectedToRightChannel = 
      connection && 
      connection.state.status !== VoiceConnectionStatus.Destroyed &&
      connection.joinConfig?.channelId === voiceChannel.id;

    if (!isConnectedToRightChannel) {
      // If there's an old connection to a different channel, destroy it
      if (connection && connection.state.status !== VoiceConnectionStatus.Destroyed) {
        console.log(`🔄 Bot is in different channel, switching to: ${voiceChannel.name}`);
        connection.destroy();
        activeConnections.delete(voiceChannel.guild.id);
      }

      // Create new connection to the user's channel
      connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      });
      
      console.log(`🔌 Joining voice channel: ${voiceChannel.name} (ID: ${voiceChannel.id})`);

      // Handle connection errors
      connection.on('error', (error) => {
        console.error('Voice connection error:', error.message);
        activeConnections.delete(voiceChannel.guild.id);
      });

      // Handle state changes
      connection.on(VoiceConnectionStatus.Signalling, () => {
        console.log('🔌 Voice connection signalling...');
      });

      connection.on(VoiceConnectionStatus.Connecting, () => {
        console.log('🔌 Voice connection connecting...');
      });

      // Remove from map when disconnected
      connection.on(VoiceConnectionStatus.Disconnected, () => {
        activeConnections.delete(voiceChannel.guild.id);
      });

      activeConnections.set(voiceChannel.guild.id, connection);

      // Wait for ready state
      try {
        await entersState(connection, VoiceConnectionStatus.Ready, 30000);
        console.log(`✅ Voice connection ready on channel: ${voiceChannel.name}`);
        await playAudio(connection, filePath, ffmpegAvailable);
      } catch (error) {
        console.error('Failed to enter ready state:', error.message);
        connection.destroy();
        activeConnections.delete(voiceChannel.guild.id);
        throw error;
      }
    } else {
      // Already connected to the right channel, just play
      console.log(`✅ Already in correct channel: ${voiceChannel.name}`);
      await playAudio(connection, filePath, ffmpegAvailable);
    }
  } catch (error) {
    console.error('Error connecting to voice channel:', error);
    throw error;
  }
}

async function checkFFmpeg() {
  try {
    await execAsync('ffmpeg -version');
    return true;
  } catch {
    return false;
  }
}

async function playAudio(connection, filePath, ffmpegAvailable) {
  return new Promise((resolve, reject) => {
    try {
      const player = createAudioPlayer();
      let resource;
      let ffmpegProcess;

      console.log(`📀 Audio setup: FFmpeg=${ffmpegAvailable}, File=${filePath}`);

      if (ffmpegAvailable) {
        // Use FFmpeg to convert MP3 to PCM
        ffmpegProcess = spawn('ffmpeg', [
          '-hide_banner',
          '-loglevel', 'error',
          '-i',
          filePath,
          '-vn',
          '-acodec', 'libopus',
          '-ab', '128k',
          '-ac', '2',
          '-ar', '48000',
          '-f', 'opus',
          'pipe:1',
        ]);

        console.log('🎬 FFmpeg process spawned');

        ffmpegProcess.stderr.on('data', (data) => {
          console.warn(`FFmpeg warning: ${data}`);
        });

        ffmpegProcess.on('error', (error) => {
          console.error('❌ FFmpeg process error:', error.message);
          player.stop();
          reject(error);
        });

        ffmpegProcess.on('close', (code) => {
          if (code !== 0) {
            console.log(`❌ FFmpeg closed with code ${code}`);
          }
        });

        resource = createAudioResource(ffmpegProcess.stdout);
        console.log('🎵 Using FFmpeg for Opus conversion');
      } else {
        // Use direct file playback
        try {
          resource = createAudioResource(filePath);
          console.log('🎵 Using direct file playback (FFmpeg not available)');
        } catch (error) {
          throw new Error(
            'Could not create audio resource. Please install FFmpeg: https://ffmpeg.org/download.html'
          );
        }
      }

      console.log('▶️ Playing audio...');
      player.play(resource);
      connection.subscribe(player);
      console.log('✅ Audio player created and subscribed to connection');
      console.log(`🎚️ Player status: ${player.state.status}`);

      // Handle audio player events
      const playingHandler = () => {
        console.log('🎵 Audio is now PLAYING');
      };
      player.once(AudioPlayerStatus.Playing, playingHandler);

      const idleHandler = () => {
        console.log('✅ Audio playback finished');
        if (ffmpegProcess) {
          ffmpegProcess.kill();
        }
        player.removeAllListeners();
        resolve();
      };
      player.once(AudioPlayerStatus.Idle, idleHandler);

      const errorHandler = (error) => {
        console.error('❌ Audio player error:', error.message);
        if (ffmpegProcess) {
          ffmpegProcess.kill();
        }
        player.removeAllListeners();
        reject(error);
      };
      player.once('error', errorHandler);

      resource.volume?.setVolume(1);
      console.log('🔊 Volume set to 1.0');

      // Timeout after 120 seconds just in case
      const timeoutId = setTimeout(() => {
        if (player.state.status !== AudioPlayerStatus.Idle) {
          console.warn('⏱️ Audio playback timeout after 120 seconds');
          player.stop();
          if (ffmpegProcess) {
            ffmpegProcess.kill();
          }
        }
      }, 120000);

      player.once(AudioPlayerStatus.Idle, () => clearTimeout(timeoutId));
    } catch (error) {
      console.error('❌ Error setting up audio:', error.message);
      console.error(error.stack);
      reject(error);
    }
  });
}

// Cleanup on process exit
process.on('exit', () => {
  activeConnections.forEach((connection) => {
    connection.destroy();
  });
});
