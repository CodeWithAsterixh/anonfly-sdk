import chalk from 'chalk';
import { getConfig } from '../utils/config';

export const whoami = () => {
    const { apiKey, baseUrl } = getConfig();

    if (!apiKey) {
        console.log(chalk.yellow('You are not logged in.'));
        console.log(`Run ${chalk.cyan('anonfly login')} to authenticate.`);
        return;
    }

    console.log(chalk.green('You are currently authenticated.'));
    console.log(`${chalk.bold('API Key:')} ${apiKey.substring(0, 4)}${'*'.repeat(apiKey.length - 8)}${apiKey.substring(apiKey.length - 4)}`);
    console.log(`${chalk.bold('Base URL:')} ${baseUrl}`);
};
