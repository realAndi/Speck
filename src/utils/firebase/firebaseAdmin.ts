// utils/firebaseAdmin.ts
import admin from 'firebase-admin';

if (!admin.apps.length) {
  const privateKey = process.env.NEXT_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_FIREBASE_PROJECT_ID,
      clientEmail: process.env.NEXT_FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    }),
    databaseURL: `https://${process.env.NEXT_FIREBASE_PROJECT_ID}.firebaseio.com`,
  });
}

export default admin;