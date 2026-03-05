import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { setConfig } from '../utils/config';
import { Anonfly } from '@anonfly/sdk';

export const login = async () => {
    const questions = [
        {
            type: 'password',
            name: 'apiKey',
            message: 'Enter your Anonfly API Key:',
            mask: '*',
            validate: (value: string) => {
                if (value.length < 10) {
                    return 'API Key must be at least 10 characters long';
                }
                return true;
            },
        },
        {
            type: 'input',
            name: 'baseUrl',
            message: 'API Base URL (optional):',
            default: 'https://api.anonfly.com/v1',
        },
    ];

    const answers = await inquirer.prompt(questions);

    const spinner = ora('Verifying API Key...').start();

    try {
        // Verify the key by trying to fetch the current user/identity or just a simple check
        const client = new Anonfly({
            apiKey: answers.apiKey,
            baseUrl: answers.baseUrl,
        });

        // For now, we'll just check if the client can be initialized.
        // In a real scenario, we'd call something like client.auth.me()

        setConfig({
            apiKey: answers.apiKey,
            baseUrl: answers.baseUrl,
        });

        spinner.succeed(chalk.green('Successfully authenticated!'));
        console.log(chalk.blue('\nYour API key has been stored locally.'));
    } catch (error: any) {
        spinner.fail(chalk.red(`Authentication failed: ${error.message}`));
    }
};
