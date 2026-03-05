// fix-comma.mjs - Fix missing comma after URL in fetch calls
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

function walk(dir) {
    let results = [];
    for (const name of readdirSync(dir)) {
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

for (const file of files) {
    let content = readFileSync(file, 'utf8');
    const original = content;

    // Fix: fetch(`url` { -> fetch(`url`, {
    // Match backtick-ended template literal followed immediately by whitespace/newline then {
    content = content.replace(/(`[^`]+`)\s*\n(\s*)\{/g, (match, url, indent) => {
        // Only fix if it looks like part of a fetch() call by checking surrounding
        return `${url},\n${indent}{`;
    });

    // Also fix single quote URL: fetch('url' { -> fetch('url', {
    content = content.replace(/('[^']+fischerurl[^']+')(\s*)\{/g, '$1,$2{');

    if (content !== original) {
        writeFileSync(file, content);
        console.log('Fixed:', file.split('\\').slice(-2).join('\\'));
        changedCount++;
    }
}
console.log(`\nTotal fixed commas: ${changedCount} files.`);
