import chalk from 'chalk';
import ora from 'ora';
import { getClient } from '../utils/sdk';

export const listKeys = async () => {
    const spinner = ora('Fetching API keys...').start();
    try {
        const client = getClient();
        const keys = await client.admin.listKeys();

        spinner.stop();

        if (keys.length === 0) {
            console.log(chalk.yellow('No API keys found.'));
            return;
        }

        console.log(chalk.bold('\nYour API Keys:'));
        console.table(keys.map(k => ({
            ID: k.id,
            Name: k.name,
            Created: new Date(k.createdAt).toLocaleDateString(),
            Status: k.isActive ? chalk.green('active') : chalk.red('inactive'),
        })));
    } catch (error: any) {
        spinner.fail(chalk.red(`Failed to list keys: ${error.message}`));
    }
};

export const createKey = async (name: string) => {
    if (!name) {
        console.log(chalk.red('Error: Name is required for creating an API key.'));
        return;
    }

    const spinner = ora(`Creating API key "${name}"...`).start();
    try {
        const client = getClient();
        const newKey = await client.admin.createKey(name);

        spinner.succeed(chalk.green(`API key "${name}" created successfully!`));
        console.log(`\n${chalk.bold('ID:')} ${newKey.id}`);
        console.log(`${chalk.bold('Key:')} ${chalk.cyan(newKey.rawKey || 'Restricted (Check keyHash)')}`);
        console.log(chalk.yellow('\nIMPORTANT: Make sure to copy your API key now if it was displayed.'));
    } catch (error: any) {
        spinner.fail(chalk.red(`Failed to create key: ${error.message}`));
    }
};

export const revokeKey = async (id: string) => {
    if (!id) {
        console.log(chalk.red('Error: Key ID is required for revoking an API key.'));
        return;
    }

    const spinner = ora(`Revoking API key "${id}"...`).start();
    try {
        const client = getClient();
        await client.admin.toggleKey(id, false);

        spinner.succeed(chalk.green(`API key "${id}" deactivated successfully!`));
    } catch (error: any) {
        spinner.fail(chalk.red(`Failed to revoke key: ${error.message}`));
    }
};

export const deleteKey = async (id: string) => {
    if (!id) {
        console.log(chalk.red('Error: Key ID is required for deleting an API key.'));
        return;
    }

    const spinner = ora(`Deleting API key "${id}"...`).start();
    try {
        const client = getClient();
        await client.admin.deleteKey(id);

        spinner.succeed(chalk.green(`API key "${id}" deleted successfully!`));
    } catch (error: any) {
        spinner.fail(chalk.red(`Failed to delete key: ${error.message}`));
    }
};
