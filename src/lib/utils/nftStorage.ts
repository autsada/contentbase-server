import { File, NFTStorage } from 'nft.storage'
import type { TokenInput } from 'nft.storage/dist/src/lib/interface'

const { NFT_STORAGE_TOKEN } = process.env

export const metadataFileName = 'metadata.json'

export async function uploadToIpfs(token: TokenInput) {
  // Initialize storage client
  const client = new NFTStorage({ token: NFT_STORAGE_TOKEN! })

  return client.store(token)
}

export function createUploadFile(
  files: Buffer[],
  fileName: string,
  mimeType: string
) {
  return new File(files, fileName, { type: mimeType })
}

// export function createGateWayURL(cid: string, fileName: string) {
//   return `https://${cid}.ipfs.dweb.link/${encodeURIComponent(fileName)}`
// }

// export function createURI(cid: string, fileName: string) {
//   return `ipfs://${cid}/${fileName}`
// }
