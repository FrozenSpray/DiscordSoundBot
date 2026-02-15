import { data as addSoundData, execute as addSoundExecute } from './addsound.js';
import { data as playData, execute as playExecute } from './playsound.js';
import { data as removeData, execute as removeExecute } from './removesound.js';
import { data as listData, execute as listExecute } from './listsounds.js';

const commands = [
  { data: addSoundData, execute: addSoundExecute },
  { data: playData, execute: playExecute },
  { data: removeData, execute: removeExecute },
  { data: listData, execute: listExecute },
];

export async function registerCommands(client) {
  const commandData = commands.map((cmd) => cmd.data.toJSON());

  // Store commands in client for easy access
  commands.forEach((cmd) => {
    client.commands.set(cmd.data.name, cmd);
  });

  return commandData;
}

export { commands };
