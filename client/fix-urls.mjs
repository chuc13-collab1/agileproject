// fix-urls.mjs - Fix all hardcoded localhost URLs in source files
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const RAILWAY_URL = 'https://agileproject-production.up.railway.app/api';

function walk(dir) {
    let results = [];
    const list = readdirSync(dir);
    for (const name of list) {
        const file = join(dir, name);
        const stat = statSync(file);
        if (stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) {
            results.push(file);
        }
    }
    return results;
}

const srcDir = 'e:/agile-project-management/client/src';
const files = walk(srcDir);
let changedCount = 0;

for (const file of files) {
    let content = readFileSync(file, 'utf8');
    const original = content;

    // Fix 1: Already-escaped broken template literals from previous script run e.g. `\${import.meta...}`
    // Revert back to: import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
    content = content.replace(
        /`\\?\$\{import\.meta\.env\.VITE_API_URL \|\| 'http:\/\/localhost:3001\/api'\}([^`]*)`,?/g,
        (match, rest) => {
            if (rest) {
                return `\`\${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}${rest}\``;
            }
            return `import.meta.env.VITE_API_URL || 'http://localhost:3001/api'`;
        }
    );

    // Fix 2: Any remaining hardcoded string literals - replace with inline Railway URL in build
    // Since .env is already set, just ensure the pattern is correct
    // Pattern: 'http://localhost:3001/api...' -> `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}...`
    content = content.replace(
        /'http:\/\/localhost:3001\/api([^']*)'/g,
        (match, rest) => {
            return `\`\${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}${rest}\``;
        }
    );

    // Pattern: "http://localhost:3001/api..." -> `${...}...`
    content = content.replace(
        /"http:\/\/localhost:3001\/api([^"]*)"/g,
        (match, rest) => {
            return `\`\${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}${rest}\``;
        }
    );

    if (content !== original) {
        writeFileSync(file, content);
        console.log('Fixed:', file.replace(srcDir.replace(/\//g, '\\'), ''));
        changedCount++;
    }
}

console.log(`\nTotal fixed: ${changedCount} files.`);
