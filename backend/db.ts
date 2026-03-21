import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';

dotenv.config();

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || 'gen-lang-client-0638535983',
  });
}

export const db = getFirestore('ai-studio-ba35b511-1bdc-44cf-a614-b6e3916302c6');
export const auth = admin.auth();
export default admin;
