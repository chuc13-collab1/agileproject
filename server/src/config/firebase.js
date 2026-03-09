import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin SDK
let credential;

// Option 1: Use serviceAccountKey.json file (local dev)
if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const serviceAccountPath = join(__dirname, '..', '..', process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
    try {
        const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
        credential = admin.credential.cert(serviceAccount);
        console.log('✅ Using Firebase Service Account from JSON file');
    } catch (error) {
        console.error('❌ Error reading serviceAccountKey.json:', error.message);
        process.exit(1);
    }
}
// Option 2: Use Base64 encoded JSON (Railway/cloud recommended)
else if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    try {
        const buff = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64');
        const serviceAccount = JSON.parse(buff.toString('utf-8'));
        credential = admin.credential.cert(serviceAccount);
        console.log('✅ Using Firebase credentials from Base64 environment variable');
    } catch (error) {
        console.error('❌ Error parsing FIREBASE_SERVICE_ACCOUNT_BASE64:', error.message);
        process.exit(1);
    }
}
// Option 3: Use separate environment variables (Legacy string parsing)
else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
    console.log(`🔑 DEBUG (Do not expose full key!):`);
    console.log(`   Length: ${privateKey.length}`);
    console.log(`   Starts with: ${privateKey.substring(0, 27)}`);
    console.log(`   Ends with: ...${privateKey.substring(privateKey.length - 25)}`);
    console.log(`   Has literal \\n: ${process.env.FIREBASE_PRIVATE_KEY.includes('\\n')}`);
    console.log(`   Has actual newline: ${process.env.FIREBASE_PRIVATE_KEY.includes('\n')}`);
    const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
    };
    credential = admin.credential.cert(serviceAccount);
    console.log('✅ Using Firebase credentials from environment variables');
} else {
    console.error('❌ Firebase credentials not found. Please set:');
    console.error('   FIREBASE_SERVICE_ACCOUNT_BASE64 (recommended) OR');
    console.error('   FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY');
    process.exit(1);
}

admin.initializeApp({ credential });

console.log('✅ Firebase Admin SDK initialized successfully');

export const auth = admin.auth();
export default admin;

