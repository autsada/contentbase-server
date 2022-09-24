import { Web3Storage, File } from 'web3.storage'
import type { Filelike } from 'web3.storage'

import type { NexusGenObjects } from '../../apollo/typegen'

const { WEB3_STORAGE_TOKEN } = process.env

export const metadataFileName = 'metadata.json'

export async function upload({
  files,
  uploadName,
}: {
  files: Iterable<Filelike>
  uploadName: string
}) {
  // Initialize storage client
  const client = new Web3Storage({ token: WEB3_STORAGE_TOKEN! })

  // Put the files to web3.storage
  return client.put(files, {
    name: uploadName,
  })
}

export function createMetadataFile(metadata: NexusGenObjects['Metadata']) {
  return new File([JSON.stringify(metadata)], metadataFileName)
}

export function createUploadFile(files: Buffer[], fileName: string) {
  return new File(files, fileName)
}

export function createGateWayURL(cid: string, fileName: string) {
  return `https://${cid}.ipfs.dweb.link/${encodeURIComponent(fileName)}`
}

export function createURI(cid: string, fileName: string) {
  return `ipfs://${cid}/${fileName}`
}
