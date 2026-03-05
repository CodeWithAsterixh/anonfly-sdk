import chalk from 'chalk';
import { clearConfig } from '../utils/config';

export const logout = () => {
    clearConfig();
    console.log(chalk.green('Successfully logged out.'));
    console.log(chalk.blue('Your local configuration and API key have been cleared.'));
};
