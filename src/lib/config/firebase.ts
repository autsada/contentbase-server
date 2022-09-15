import admin from 'firebase-admin'
import { initializeApp, getApps, getApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

const { FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL } =
  process.env

function initializeFirebaseAdmin() {
  return !getApps.length
    ? initializeApp({
        credential: admin.credential.cert({
          projectId: FIREBASE_PROJECT_ID,
          privateKey: FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          clientEmail: FIREBASE_CLIENT_EMAIL,
        }),
      })
    : getApp()
}

const firebaseApp = initializeFirebaseAdmin()

export const db = getFirestore(firebaseApp)
export const auth = getAuth(firebaseApp)

// Collections
export const accountsCollection = 'accounts'
export const walletsCollection = 'wallets'
