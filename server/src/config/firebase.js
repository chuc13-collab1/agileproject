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

// Option 1: Use serviceAccountKey.json file (RECOMMENDED)
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
// Option 2: Use environment variables
else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };
    credential = admin.credential.cert(serviceAccount);
    console.log('✅ Using Firebase credentials from environment variables');
} else {
    console.error('❌ Firebase credentials not found. Please provide either:');
    console.error('   1. FIREBASE_SERVICE_ACCOUNT_PATH in .env');
    console.error('   2. FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in .env');
    process.exit(1);
}

admin.initializeApp({ credential });

console.log('✅ Firebase Admin SDK initialized successfully');

export const auth = admin.auth();
export default admin;
