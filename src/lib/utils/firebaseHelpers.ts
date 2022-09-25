import { firestore } from 'firebase-admin'

import { auth, bucket } from '../config/firebase'
import { NexusGenObjects } from '../../apollo/typegen'

type Args<T = Record<string, any>> = {
  db: firestore.Firestore
  collectionName: string
  docId: string
  data: T
  fieldName: string
  fieldValue: any
}

export function snapshotToDoc<T extends Record<string, any>>(
  snapshot: firestore.DocumentSnapshot<firestore.DocumentData>
) {
  const data = snapshot.data() as T & {
    createdAt: firestore.Timestamp
    updatedAt?: firestore.Timestamp
  }

  const createdAt = data?.createdAt ? data.createdAt.toDate().toString() : null
  const updatedAt = data?.updatedAt ? data.updatedAt.toDate().toString() : null

  const doc: T = {
    ...data,
    id: snapshot.id,
    createdAt,
    updatedAt,
  }

  return doc
}

export async function getDocById<T extends Record<string, any>>({
  db,
  collectionName,
  docId,
}: Pick<Args, 'db' | 'collectionName' | 'docId'>) {
  const snapshot = await db.collection(collectionName).doc(docId).get()

  if (!snapshot.exists) return null

  return snapshotToDoc<T>(snapshot)
}

export function createDocRef({
  db,
  collectionName,
}: Pick<Args, 'db' | 'collectionName'>) {
  return db.collection(collectionName).doc()
}

export function createDoc<T extends Record<string, any>>({
  db,
  collectionName,
  data,
}: Pick<Args<T>, 'db' | 'collectionName' | 'data'>) {
  return db.collection(collectionName).add({
    ...data,
    createdAt: new Date(),
  })
}

export function createDocWithId<T extends Record<string, any>>({
  db,
  collectionName,
  docId,
  data,
}: Pick<Args<T>, 'db' | 'collectionName' | 'docId' | 'data'>) {
  return db
    .collection(collectionName)
    .doc(docId)
    .set(
      {
        ...data,
        createdAt: new Date(),
      },
      { merge: true }
    )
}

export function updateDocById<T extends Record<string, any>>({
  db,
  collectionName,
  docId,
  data,
}: Pick<Args<T>, 'db' | 'collectionName' | 'docId' | 'data'>) {
  return db
    .collection(collectionName)
    .doc(docId)
    .set(
      {
        ...data,
        updatedAt: new Date(),
      },
      { merge: true }
    )
}

// export async function deleteDocById<T extends Record<string, any>>({
//   db,
//   collectionName,
//   docId,
// }: Pick<Args, 'db' | 'collectionName' | 'docId'>) {
//   const result = await db.collection(collectionName).doc(docId).delete()

//   return result
// }

export async function searchDocByField<T extends Record<string, any>>({
  db,
  collectionName,
  fieldName,
  fieldValue,
}: Pick<Args, 'db' | 'collectionName' | 'fieldName' | 'fieldValue'>) {
  const snapshots = await db
    .collection(collectionName)
    .where(fieldName, '==', fieldValue)
    .get()

  let docs: T[] = []

  if (snapshots.empty) return []

  snapshots.forEach((snapshot) => {
    const data = snapshotToDoc<T>(snapshot)
    docs.push(data)
  })

  return docs
}

export async function verifyIdToken(token: string) {
  const decodedToken = await auth.verifyIdToken(token)

  if (!decodedToken) return null

  return decodedToken
}

export async function getUser(uid: string) {
  const user = await auth.getUser(uid)

  if (!user) return null

  return user
}

export async function uploadFileToStorage({
  userId,
  handle,
  uploadType,
  file,
  fileName,
}: Pick<
  NexusGenObjects['UploadParams'],
  'userId' | 'handle' | 'uploadType' | 'fileName'
> & { file: Buffer }) {
  const path = `${userId}/${handle}/${uploadType}/${fileName}`
  await bucket.file(path).save(file, { resumable: true })

  const uploadedFile = bucket.file(path)
  const urls = await uploadedFile.getSignedUrl({
    action: 'read',
    expires: Date.now() + 1000 * 60 * 60 * 24 * 365 * 1000,
  })

  return { storagePath: path, storageURL: urls[0] }
}
