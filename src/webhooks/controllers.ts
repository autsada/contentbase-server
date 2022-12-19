import type { Request, Response } from "express"
import axios from "axios"

import { isValidSignatureForStringBody, authClient } from "../lib"

const { KMS_BASE_URL, KMS_ACCESS_KEY } = process.env

const kmsBaseUrl = KMS_BASE_URL || "http://localhost:8000"

export async function onAddressUpdated(req: Request, res: Response) {
  try {
    // Get signature from headers
    const signature = req.headers["x-alchemy-signature"]
    // Get raw body from req
    const rawBody = req.rawBody
    if (!signature || !rawBody) throw new Error("Invalid request")
    // Validate signature
    const isValid = isValidSignatureForStringBody(rawBody, signature as string)
    if (!isValid) throw new Error("Request corrupted in transit.")
    const body = req.body
    // Get token for GCP to authenticate between services (for staging and production environments).
    const token = await authClient.getIdToken()
    // Call the update activity route in kms server.
    await axios({
      url: `${kmsBaseUrl}/activities/update`,
      headers: {
        "x-access-key": KMS_ACCESS_KEY!,
        Authorization: token || "",
      },
      method: "POST",
      data: body,
    })

    res.status(200).end()
  } catch (error) {
    res.status(500).end()
  }
}
