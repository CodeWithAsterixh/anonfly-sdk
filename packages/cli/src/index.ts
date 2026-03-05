#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { login } from './commands/login';
import { logout } from './commands/logout';
import { whoami } from './commands/whoami';
import { init } from './commands/init';
import { listKeys, createKey, revokeKey, deleteKey } from './commands/keys';
import { listRooms, createRoom, tailRoom, deleteRoom } from './commands/rooms';

const program = new Command();

program
    .name('anonfly')
    .description('CLI for managing Anonfly privacy-preserving infrastructure')
    .version('1.0.0');

program
    .command('init')
    .description('Scaffold a new Anonfly project from a template')
    .action(init);

// Auth Commands
program
    .command('login')
    .description('Authenticate with your Anonfly API key')
    .action(login);

program
    .command('logout')
    .description('Clear local authentication and configuration')
    .action(logout);

program
    .command('whoami')
    .description('Display current authentication status')
    .action(whoami);

// Keys Commands
const keys = program.command('keys').description('Manage API keys');

keys
    .command('list')
    .description('List all active API keys')
    .action(listKeys);

keys
    .command('create')
    .description('Create a new API key')
    .argument('<name>', 'Name/Description for the new key')
    .action(createKey);

keys
    .command('revoke')
    .description('Deactivate an API key')
    .argument('<id>', 'ID of the key to revoke')
    .action(revokeKey);

keys
    .command('delete')
    .description('Permanently delete an API key')
    .argument('<id>', 'ID of the key to delete')
    .action(deleteKey);

// Rooms Commands
const rooms = program.command('rooms').description('Manage chatrooms');

rooms
    .command('list')
    .description('List all available chatrooms')
    .action(listRooms);

rooms
    .command('create')
    .description('Create a new chatroom')
    .argument('<name>', 'Name of the chatroom')
    .option('-p, --private', 'Make the room private')
    .option('-d, --description <text>', 'Room description')
    .option('--password <pwd>', 'Set a password for the room')
    .action(createRoom);

rooms
    .command('tail')
    .description('Listen to real-time messages in a room')
    .argument('<id>', 'ID of the room to tail')
    .action(tailRoom);

rooms
    .command('delete')
    .description('Permanently delete a chatroom')
    .argument('<id>', 'ID of the room to delete')
    .action(deleteRoom);

program.parse();
