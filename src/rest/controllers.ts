import type { Request, Response } from "express"
import convert from "heic-convert"
import type { TokenInput } from "nft.storage/dist/src/token"

import { createUploadFile, uploadToIpfs, uploadFileToStorage } from "../lib"
import type { NexusGenObjects } from "../apollo/typegen"

/**
 * Stores an image file on Web3.Storage, along with a small metadata.json
 * @param {string} req.body.userId a user's id from authentication system
 * @param {string} req.body.fileName a name of the image file
 * @param {string} req.body.handle a user's handle name
 *
 */
export async function uploadProfileImage(req: Request, res: Response) {
  try {
    const { userId, address, fileName, handle, mime } = req.body as Pick<
      NexusGenObjects["UploadParams"],
      "userId" | "address" | "fileName" | "handle" | "mime"
    >

    const file = req.file
    if (!file) throw new Error("Bad request")

    let imageName = fileName
    let mimeType = mime

    // Construct image file
    let buffer = file.buffer

    // Convert .HEIC to .jpeg
    if (imageName.toLowerCase().endsWith("heic")) {
      // Change buffer format
      buffer = (await convert({
        buffer,
        format: "JPEG",
        quality: 1,
      })) as Buffer

      // Change file extension
      imageName = imageName.split(".")[0] + ".JPEG"
      mimeType = "image/jpeg"
    }

    // 1. Upload to cloud storage
    const { storagePath, storageURL } = await uploadFileToStorage({
      userId,
      handle,
      uploadType: "avatar",
      file: buffer,
      fileName: imageName,
    })

    // 2. Upload to ipfs (nft.storage)
    // 2.1 Create an image file
    const image = createUploadFile([buffer], imageName, mimeType)

    // 2.2 Create additional properties
    const properties: NexusGenObjects["MetadataCustomProps"] = {
      handle,
      owner: address,
      type: "avatar",
      contentURI: "",
      storageURL,
      storagePath,
    }

    // 2.3 Construct metadata object
    const token: TokenInput = {
      image,
      name: "Profile Image",
      description: `A profile image of @${handle}.`,
      properties,
    }

    // Upload image and metadata to nft.storage
    const { ipnft, url } = await uploadToIpfs(token)

    res.status(200).json({
      cid: ipnft,
      tokenURI: url,
      storagePath,
      storageURL,
    })
  } catch (error) {
    res.status(500).send((error as any).message)
  }
}
