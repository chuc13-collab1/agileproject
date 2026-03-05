import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
const fs = { readFileSync, writeFileSync, readdirSync, statSync };
const path = { join };

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('e:/agile-project-management/client/src');
let changedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Pattern 1: 'http://localhost:3001/api...'
    // Replace with : `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}...`
    // But wait! If it was already in a template string, let's just handle it generally.

    // Easiest is to replace the exact origin regardless of quotes:
    // "http://localhost:3001/api/projects" -> `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/projects`
    // To avoid breaking syntax, let's be careful.

    // Replace 'http://localhost:3001/api' and `http://localhost:3001/api` and "http://localhost:3001/api"
    content = content.replace(/'http:\/\/localhost:3001\/api([^']*)'/g, "`\\${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}$1`");
    content = content.replace(/\"http:\/\/localhost:3001\/api([^\"]*)\"/g, "`\\${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}$1`");

    // For existing template strings: `http://localhost:3001/api/...`
    content = content.replace(/`http:\/\/localhost:3001\/api([^`]*)`/g, "`\\${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}$1`");

    // Specific case for file uploads
    content = content.replace(/`http:\/\/localhost:3001\/uploads([^`]*)`/g, "`\\${(import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace('/api', '')}/uploads$1`");

    // Specific case for just API string definition
    // const API_URL = 'http://localhost:3001/api' -> 
    // const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
    // But our first regex handled the string itself by turning it into a template string: `...`
    // Which is valid TS/JS.

    if (content !== original) {
        fs.writeFileSync(file, content);
        console.log('Fixed:', file);
        changedCount++;
    }
});

console.log('Fixed ' + changedCount + ' files.');
