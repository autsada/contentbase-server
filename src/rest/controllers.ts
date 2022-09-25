import type { Request, Response } from 'express'
import convert from 'heic-convert'

import {
  upload,
  createMetadataFile,
  createUploadFile,
  metadataFileName,
  createGateWayURL,
  createURI,
  uploadFileToStorage,
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
    const { userId, fileName, handle } = req.body as Pick<
      NexusGenObjects['UploadParams'],
      'userId' | 'fileName' | 'handle'
    >

    const file = req.file
    if (!file) throw new Error('Bad request')

    let imageName = fileName

    // Construct image file
    let buffer = file.buffer

    // Convert .HEIC to .jpeg
    if (imageName.toLowerCase().endsWith('heic')) {
      // Change buffer format
      buffer = (await convert({
        buffer,
        format: 'JPEG',
        quality: 1,
      })) as Buffer

      // Change file extension
      imageName = imageName.split('.')[0] + '.JPEG'
    }

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

    const { storagePath, storageURL } = await uploadFileToStorage({
      userId,
      handle,
      uploadType: 'avatar',
      file: buffer,
      fileName: imageName,
    })

    res.status(200).json({
      metadataGateWayURL,
      metadataURI,
      imageGateWayURL,
      imageURI,
      storagePath,
      storageURL,
    })
  } catch (error) {
    res.status(500).send((error as any).message)
  }
}
