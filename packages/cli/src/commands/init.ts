import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const init = async () => {
    const questions = [
        {
            type: 'input',
            name: 'name',
            message: 'Project name:',
            default: 'my-anonfly-app',
            validate: (value: string) => {
                if (/^([a-z0-9-_])+$/.test(value)) {
                    return true;
                }
                return 'Project name must be alphanumeric with hyphens or underscores';
            },
        },
        {
            type: 'list',
            name: 'template',
            message: 'Select a template:',
            choices: [
                { name: 'React + Vite (TypeScript)', value: 'react-vite' },
            ],
        },
    ];

    const answers = await inquirer.prompt(questions);
    const projectPath = path.join(process.cwd(), answers.name);

    if (fs.existsSync(projectPath)) {
        const { overwrite } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'overwrite',
                message: `Directory ${answers.name} already exists. Overwrite?`,
                default: false,
            }
        ]);
        if (!overwrite) {
            console.log(chalk.yellow('Aborted.'));
            return;
        }
    }

    const spinner = ora(`Scaffolding project in ${answers.name}...`).start();

    try {
        const templatePath = path.join(__dirname, '..', 'templates', answers.template);

        // Helper to recursively copy files
        const copyRecursive = (src: string, dest: string) => {
            const stats = fs.statSync(src);
            if (stats.isDirectory()) {
                if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
                fs.readdirSync(src).forEach(childItemName => {
                    copyRecursive(path.join(src, childItemName), path.join(dest, childItemName));
                });
            } else {
                let content = fs.readFileSync(src, 'utf8');
                if (path.basename(src) === 'package.json') {
                    content = content.replace('{{name}}', answers.name);
                }
                fs.writeFileSync(dest, content);
            }
        };

        copyRecursive(templatePath, projectPath);

        spinner.succeed(chalk.green(`Project "${answers.name}" created successfully!`));

        console.log(`\nNext steps:`);
        console.log(chalk.cyan(`  cd ${answers.name}`));
        console.log(chalk.cyan(`  npm install`));
        console.log(chalk.cyan(`  npm run dev`));
        console.log(`\nHappy hacking with ${chalk.bold('Anonfly')}! 🚀`);

    } catch (error: any) {
        spinner.fail(chalk.red(`Failed to scaffold project: ${error.message}`));
    }
};
