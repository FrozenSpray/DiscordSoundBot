import { commands } from '../commands/index.js';

export async function handleInteraction(interaction, client) {
  // Log ALL interactions for debugging
  console.log(`\n📨 Raw interaction received:`);
  console.log(`   commandName: ${interaction.commandName}`);
  console.log(`   type: ${interaction.type}`);
  console.log(`   isAutocomplete: ${interaction.isAutocomplete()}`);
  console.log(`   isChatInputCommand: ${interaction.isChatInputCommand()}`);
  
  if (interaction.commandName === 'playsound') {
    console.log('   ⚠️ PLAYSOUND interaction - checking autocomplete...');
    console.log(`      isAutocomplete: ${interaction.isAutocomplete()}`);
    console.log(`      isChatInputCommand: ${interaction.isChatInputCommand()}`);
  }

  const command = commands.find((cmd) => cmd.data.name === interaction.commandName);

  if (!command) {
    console.warn(`⚠️ No command found: ${interaction.commandName}`);
    return;
  }

  console.log(`📝 Received interaction: /${interaction.commandName} from ${interaction.user.tag}`);
  console.log(`   isAutocomplete: ${interaction.isAutocomplete()}, isChatInputCommand: ${interaction.isChatInputCommand()}`);

  // Handle autocomplete
  if (interaction.isAutocomplete()) {
    try {
      console.log('🔍 Autocomplete interaction received');
      const focused = interaction.options.getFocused(true);
      console.log(`   Focused field: ${focused.name}, value: "${focused.value}"`);

      if (
        focused.name === 'name' &&
        (interaction.commandName === 'playsound' || interaction.commandName === 'removesound')
      ) {
        console.log('📂 Loading sounds for autocomplete...');
        try {
          const { loadSoundMappings } = await import('../utils/fileUtils.js');
          const sounds = await loadSoundMappings();
          console.log(`   Available sounds: ${Object.keys(sounds).join(', ') || 'No sounds'}`);
          
          const choices = Object.keys(sounds)
            .filter((name) => name.startsWith(focused.value.toLowerCase()))
            .slice(0, 25);
          
          console.log(`   Filtered choices (${choices.length}): ${choices.join(', ')}`);
          console.log(`   Responding with ${choices.length} choices`);

          await interaction.respond(
            choices.map((choice) => ({ name: choice, value: choice }))
          );
          return;
        } catch (loadError) {
          console.error('❌ Error loading sounds for autocomplete:', loadError.message);
          await interaction.respond([]);
          return;
        }
      }

      console.log('❌ Autocomplete not for playsound/removesound with name field');
      await interaction.respond([]);
      return;
    } catch (error) {
      console.error('❌ Autocomplete error:', error.message);
      try {
        await interaction.respond([]);
      } catch (err) {
        console.error('❌ Failed to respond to autocomplete:', err.message);
      }
      return;
    }
  }

  // Execute command
  if (interaction.isChatInputCommand()) {
    console.log(`🚀 Executing: /${interaction.commandName}`);
    await command.execute(interaction);
  }
}
