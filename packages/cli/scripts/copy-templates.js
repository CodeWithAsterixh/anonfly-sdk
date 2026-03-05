import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcTemplates = path.join(__dirname, '..', 'src', 'templates');
const distTemplates = path.join(__dirname, '..', 'dist', 'templates');

async function copyTemplates() {
    try {
        if (await fs.pathExists(srcTemplates)) {
            await fs.copy(srcTemplates, distTemplates);
            console.log('Templates copied to dist/templates');
        } else {
            console.warn('Source templates directory not found:', srcTemplates);
        }
    } catch (err) {
        console.error('Error copying templates:', err);
        process.exit(1);
    }
}

copyTemplates();
