// fix-nested.mjs - Fix double-nested template literals
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

function walk(dir) {
    let results = [];
    const list = readdirSync(dir);
    for (const name of list) {
        const file = join(dir, name);
        const stat = statSync(file);
        if (stat.isDirectory()) results = results.concat(walk(file));
        else if (file.endsWith('.ts') || file.endsWith('.tsx')) results.push(file);
    }
    return results;
}

const srcDir = 'e:/agile-project-management/client/src';
const files = walk(srcDir);
let changedCount = 0;

const API_FALLBACK = 'http://localhost:3001/api';

for (const file of files) {
    let content = readFileSync(file, 'utf8');
    const original = content;

    // Fix: `${ENV || `${ENV || 'fallback'}`}/path` -> `${ENV || 'fallback'}/path`
    const doublePattern = /`\$\{import\.meta\.env\.VITE_API_URL \|\| `\$\{import\.meta\.env\.VITE_API_URL \|\| '([^']+)'\}`\}([^`]*)`/g;
    content = content.replace(doublePattern, (match, fallback, rest) => {
        return `\`\${import.meta.env.VITE_API_URL || '${fallback}'}${rest}\``;
    });

    // Also fix pattern where there's a missing comma before `{` options object:
    // fetch(`url` { -> fetch(`url`, {
    content = content.replace(/\`([^`]+)\`\s*\n(\s*)\{/g, (match, url, indent, opts) => {
        // Only fix if it looks like a fetch call (check surrounding context)
        return `\`${url}\`,\n${indent}{`;
    });

    // Fix escaped dollar for uploads URL
    // `\${(import.meta.env.VITE_API_URL || `${...}`).replace...}`
    const escapedPattern = /`\\\$\{\(import\.meta\.env\.VITE_API_URL \|\| `\$\{import\.meta\.env\.VITE_API_URL \|\| '([^']+)'\}`\)\.replace([^`]*)`/g;
    content = content.replace(escapedPattern, (match, fallback, rest) => {
        return `\`\${(import.meta.env.VITE_API_URL || '${fallback}').replace${rest}\``;
    });

    if (content !== original) {
        writeFileSync(file, content);
        console.log('Fixed:', file.split('\\').slice(-2).join('\\'));
        changedCount++;
    }
}

console.log(`\nTotal fixed: ${changedCount} files.`);
