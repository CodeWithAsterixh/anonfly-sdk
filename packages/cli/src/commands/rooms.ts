import chalk from 'chalk';
import ora from 'ora';
import { getClient } from '../utils/sdk';

export const listRooms = async () => {
    const spinner = ora('Fetching chatrooms...').start();
    try {
        const client = getClient();
        const rooms = await client.rooms.list();

        spinner.stop();

        if (rooms.length === 0) {
            console.log(chalk.yellow('No chatrooms found.'));
            return;
        }

        console.log(chalk.bold('\nChatrooms:'));
        console.table(rooms.map(r => ({
            ID: r.id,
            Name: r.name,
            Public: r.isPublic ? chalk.green('Yes') : chalk.red('No'),
            Created: new Date(r.createdAt).toLocaleDateString(),
        })));
    } catch (error: any) {
        spinner.fail(chalk.red(`Failed to list rooms: ${error.message}`));
    }
};

export const createRoom = async (name: string, options: { private?: boolean; description?: string; password?: string }) => {
    if (!name) {
        console.log(chalk.red('Error: Room name is required.'));
        return;
    }

    const spinner = ora(`Creating chatroom "${name}"...`).start();
    try {
        const client = getClient();
        const room = await client.rooms.create({
            roomname: name,
            isPrivate: options.private,
            description: options.description,
            password: options.password
        });

        spinner.succeed(chalk.green(`Chatroom "${name}" created successfully!`));
        console.log(`\n${chalk.bold('ID:')} ${room.id}`);
        if (!room.isPublic) {
            console.log(chalk.yellow('This is a private room.'));
        }
    } catch (error: any) {
        spinner.fail(chalk.red(`Failed to create room: ${error.message}`));
    }
};

export const tailRoom = async (roomId: string) => {
    const spinner = ora(`Connecting to room ${roomId}...`).start();
    try {
        const client = getClient();

        // Ensure WebSocket is connected
        if (!client.ws) {
            throw new Error('WebSocket client not initialized');
        }

        client.ws.connect();

        client.ws.on('connected', () => {
            spinner.succeed(chalk.green(`Connected to room ${roomId}. Listening for messages...`));

            // Subscribe to room topic
            client.ws?.subscribe(`room:${roomId}`, (message) => {
                const timestamp = new Date().toLocaleTimeString();
                console.log(`${chalk.gray(`[${timestamp}]`)} ${chalk.bold(message.senderAid?.substring(0, 8) || 'Unknown')}: ${message.content}`);
            });
        });

        client.ws.on('error', (err) => {
            spinner.fail(chalk.red(`WebSocket error: ${err.message}`));
        });

        // Keep process alive
        process.on('SIGINT', () => {
            client.ws?.disconnect();
            process.exit();
        });

    } catch (error: any) {
        spinner.fail(chalk.red(`Failed to tail room: ${error.message}`));
    }
};

export const deleteRoom = async (roomId: string) => {
    if (!roomId) {
        console.log(chalk.red('Error: Room ID is required for deleting a chatroom.'));
        return;
    }

    const spinner = ora(`Deleting chatroom "${roomId}"...`).start();
    try {
        const client = getClient();
        await client.rooms.delete(roomId);

        spinner.succeed(chalk.green(`Chatroom "${roomId}" deleted successfully!`));
    } catch (error: any) {
        spinner.fail(chalk.red(`Failed to delete room: ${error.message}`));
    }
};
