import * as admin from 'firebase-admin';
import { existsSync, readFileSync } from 'fs';

if (admin.apps.length === 0) {
  // In development, it may be useful to provide a service-account.json file.
  if (existsSync('service-account.json')) {
    const serviceAccount = JSON.parse(readFileSync('service-account.json', { encoding: 'utf8' }))
    const adminConfig = JSON.parse(process.env.FIREBASE_CONFIG)
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      ...adminConfig
    });
  }
  else {
    admin.initializeApp()
  }
}

export const appStorage = admin.storage().bucket()
