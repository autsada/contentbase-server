import * as crypto from "crypto"
import CryptoJs from "crypto-js"
import { verifyIdToken, getUser } from "./firebaseHelpers"

const { KMS_ENCRYPT_KEY, ALCHEMY_WEBHOOK_SIGNING_KEY } = process.env

export function encryptString(text: string) {
  const encrypted = CryptoJs.AES.encrypt(text, KMS_ENCRYPT_KEY!).toString()

  return encrypted
}

export function decryptString(text: string) {
  const bytes = CryptoJs.AES.decrypt(text, KMS_ENCRYPT_KEY!)

  return bytes.toString(CryptoJs.enc.Utf8)
}

export async function getUserFromAuthorizationHeader(
  header: string | undefined
) {
  if (!header) return { user: null }

  const token = header.split(" ")[1]

  if (!token) return { user: null }

  const decodedToken = await verifyIdToken(token)
  if (!decodedToken) return { user: null }

  const user = await getUser(decodedToken.uid)
  if (!user) return { user: null }

  return { user }
}

export function isValidSignatureForStringBody(
  body: string, // must be raw string body, not json transformed version of the body
  signature: string // your "X-Alchemy-Signature" from header
): boolean {
  const hmac = crypto.createHmac("sha256", ALCHEMY_WEBHOOK_SIGNING_KEY!) // Create a HMAC SHA256 hash using the signing key
  hmac.update(body, "utf8") // Update the token hash with the request body using utf8
  const digest = hmac.digest("hex")
  return signature === digest
}
