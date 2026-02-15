import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SOUNDS_DIR = path.join(dirname(__dirname), '..', 'sounds');
const DATA_DIR = path.join(dirname(__dirname), '..', 'data');
const MAPPINGS_FILE = path.join(DATA_DIR, 'soundMappings.json');

export async function ensureDirectories() {
  try {
    await fs.mkdir(SOUNDS_DIR, { recursive: true });
    await fs.mkdir(DATA_DIR, { recursive: true });

    // Create mappings file if it doesn't exist
    try {
      await fs.access(MAPPINGS_FILE);
    } catch {
      await fs.writeFile(MAPPINGS_FILE, JSON.stringify({}, null, 2));
    }
  } catch (error) {
    console.error('Error creating directories:', error);
    throw error;
  }
}

export async function loadSoundMappings() {
  try {
    const data = await fs.readFile(MAPPINGS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading sound mappings:', error);
    return {};
  }
}

export async function saveSoundMappings(mappings) {
  try {
    await fs.writeFile(MAPPINGS_FILE, JSON.stringify(mappings, null, 2));
  } catch (error) {
    console.error('Error saving sound mappings:', error);
    throw error;
  }
}
