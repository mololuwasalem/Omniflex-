import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import firebaseConfig from '../firebase-applet-config.json';

dotenv.config();

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

// Ensure we are using the correct database instance
const app = admin.apps[0]!;
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = admin.auth(app);
export default admin;
