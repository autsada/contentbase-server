import admin from 'firebase-admin'
import {
  initializeApp,
  getApps,
  getApp,
  applicationDefault,
} from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'
import { getStorage } from 'firebase-admin/storage'

const {
  FIREBASE_PROJECT_ID,
  FIREBASE_PRIVATE_KEY,
  FIREBASE_CLIENT_EMAIL,
  FIREBASE_STORAGE_BUCKET,
  NODE_ENV,
} = process.env

function initializeFirebaseAdmin() {
  return !getApps.length
    ? initializeApp({
        credential:
          NODE_ENV === 'production' || NODE_ENV === 'staging'
            ? applicationDefault()
            : admin.credential.cert({
                projectId: FIREBASE_PROJECT_ID,
                privateKey: FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                clientEmail: FIREBASE_CLIENT_EMAIL,
              }),
        storageBucket: FIREBASE_STORAGE_BUCKET,
      })
    : getApp()
}

const firebaseApp = initializeFirebaseAdmin()

export const db = getFirestore(firebaseApp)
export const auth = getAuth(firebaseApp)
export const storage = getStorage(firebaseApp)

// Collections
export const accountsCollection = 'accounts'
export const walletsCollection = 'wallets'
export const activitiesCollection = 'activities'
