#!/usr/bin/env node
import { CommandLineParser } from './src/command-line.js';
import { serverDirectory } from './src/server-directory.js';

console.log(`Node version: ${process.version}. Running in ${process.env.NODE_ENV} environment. Server directory: ${serverDirectory}`);

// config.yaml will be set when parsing command line arguments
const cliArgs = new CommandLineParser().parse(process.argv);
globalThis.DATA_ROOT = cliArgs.dataRoot;
globalThis.COMMAND_LINE_ARGS = cliArgs;
process.chdir(serverDirectory);

console.log('CLI Args:', cliArgs);

if (cliArgs.demo) {
    console.log('Demo mode enabled. Initializing demo content...');
    const fs = await import('node:fs');
    const path = await import('node:path');

    const exampleDir = path.join(serverDirectory, 'Example');
    const dataDir = path.join(serverDirectory, 'data');
    const defaultUserDir = path.join(dataDir, 'default-user');
    const charactersDir = path.join(defaultUserDir, 'characters');
    const presetsDir = path.join(defaultUserDir, 'presets', 'openai');

    // Ensure directories exist
    if (!fs.existsSync(charactersDir)) {
        fs.mkdirSync(charactersDir, { recursive: true });
    }
    if (!fs.existsSync(presetsDir)) {
        fs.mkdirSync(presetsDir, { recursive: true });
    }

    // Copy Character
    const charSource = path.join(exampleDir, '亞瑟·柯南·道爾爵士.json');
    const charDest = path.join(charactersDir, '亞瑟·柯南·道爾爵士.json');
    if (fs.existsSync(charSource)) {
        console.log('Copying demo character...');
        fs.copyFileSync(charSource, charDest);
    }

    const presetSource = path.join(exampleDir, 'Demo.json');
    const presetDest = path.join(presetsDir, 'Demo.json');
    if (fs.existsSync(presetSource)) {
        console.log('Copying demo preset...');
        fs.copyFileSync(presetSource, presetDest);
    }

    const settingsSource = path.join(exampleDir, 'settings_default-user_20250926-134715.json');
    const settingsDest = path.join(defaultUserDir, 'settings.json');
    if (fs.existsSync(settingsSource)) {
        console.log('Copying demo settings...');
        fs.copyFileSync(settingsSource, settingsDest);
    }

    fs.writeFileSync(path.join(serverDirectory, 'public', 'demo_mode.json'), JSON.stringify({ demo: true }));
} else {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const demoMarker = path.join(serverDirectory, 'public', 'demo_mode.json');
    if (fs.existsSync(demoMarker)) {
        fs.unlinkSync(demoMarker);
    }
}

try {
    await import('./src/server-main.js');
} catch (error) {
    console.error('A critical error has occurred while starting the server:', error);
}
