import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

if (admin.apps.length === 0) {
  admin.initializeApp(functions.config().firebase);
}

export const appStorage = admin.storage().bucket()
