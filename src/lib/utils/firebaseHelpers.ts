import { auth, bucket } from "../config/firebase"
import { NexusGenObjects } from "../../apollo/typegen"

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
  NexusGenObjects["UploadParams"],
  "userId" | "handle" | "uploadType" | "fileName"
> & { file: Buffer }) {
  const path = `${userId}/${handle}/${uploadType}/${fileName}`
  await bucket.file(path).save(file, { resumable: true })

  const uploadedFile = bucket.file(path)
  const urls = await uploadedFile.getSignedUrl({
    action: "read",
    expires: Date.now() + 1000 * 60 * 60 * 24 * 365 * 1000,
  })

  return { storagePath: path, storageURL: urls[0] }
}
