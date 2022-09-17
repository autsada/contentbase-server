import admin from 'firebase-admin'
import {
  initializeApp,
  getApps,
  getApp,
  applicationDefault,
} from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

function initializeFirebaseAdmin() {
  return !getApps.length
    ? initializeApp({
        credential: applicationDefault(),
      })
    : getApp()
}

const firebaseApp = initializeFirebaseAdmin()

export const db = getFirestore(firebaseApp)
export const auth = getAuth(firebaseApp)

// Collections
export const accountsCollection = 'accounts'
export const walletsCollection = 'wallets'
