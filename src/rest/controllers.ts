import type { Request, Response } from 'express'

import {
  upload,
  createMetadataFile,
  createUploadFile,
  metadataFileName,
  createGateWayURL,
  createURI,
} from '../lib'
import type { NexusGenObjects } from '../apollo/typegen'

/**
 * Stores an image file on Web3.Storage, along with a small metadata.json
 * @param {string} req.body.userId a user's id from authentication system
 * @param {string} req.body.fileName a name of the image file
 * @param {string} req.body.handle a user's handle name
 *
 */
export async function uploadProfileImage(req: Request, res: Response) {
  try {
    const { userId, fileName, handle } = req.body as {
      userId: string
      fileName: string
      handle: string
    }

    const file = req.file
    if (!file) throw new Error('Bad request')

    // Construct file names
    const imageName = fileName

    // Construct image file
    const buffer = file.buffer
    const imageFile = createUploadFile([buffer], imageName)

    // Construct metadata file
    const metadata: NexusGenObjects['Metadata'] = {
      handle,
      fileName,
      type: 'avatar',
    }
    const metadataFile = createMetadataFile(metadata)

    // Construct upload name
    const timeStamp = new Date().toISOString()
    const uploadName = `${userId}/${handle}/avatar/${timeStamp}`

    const cid = await upload({ files: [imageFile, metadataFile], uploadName })

    // Returns image and metadata urls
    const metadataGateWayURL = createGateWayURL(cid, metadataFileName)
    const metadataURI = createURI(cid, metadataFileName)
    const imageGateWayURL = createGateWayURL(cid, imageName)
    const imageURI = createURI(cid, imageName)

    res
      .status(200)
      .json({ metadataGateWayURL, metadataURI, imageGateWayURL, imageURI })
  } catch (error) {
    res.status(500).send((error as any).message)
  }
}
