// Firebase Configuration
// This file initializes Firebase with environment variables from Netlify

// Firebase configuration object - uses environment variables only
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Validate that all required environment variables are present
const requiredEnvVars = [
  'FIREBASE_API_KEY',
  'FIREBASE_AUTH_DOMAIN', 
  'FIREBASE_PROJECT_ID',
  'FIREBASE_STORAGE_BUCKET',
  'FIREBASE_MESSAGING_SENDER_ID',
  'FIREBASE_APP_ID'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('Missing required environment variables:', missingVars);
  throw new Error(`Firebase configuration incomplete. Missing: ${missingVars.join(', ')}`);
}

// Initialize Firebase
import { initializeApp } from 'firebase/app';
import { getAuth, GithubAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const githubProvider = new GithubAuthProvider();

// Domain security settings
export const ADMIN_DOMAIN = process.env.ADMIN_DOMAIN || "rodrigueshandyman.com";
export const ALLOWED_DOMAINS = (process.env.ALLOWED_DOMAINS || "rodrigueshandyman.com,www.rodrigueshandyman.com").split(',');
export const REQUIRE_DOMAIN_VERIFICATION = process.env.REQUIRE_DOMAIN_VERIFICATION === 'true';
