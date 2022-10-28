import type { Request, Response } from "express"
import axios from "axios"

import { isValidSignatureForStringBody, authClient } from "../lib"
import type { Environment } from "../types"

const { KMS_DEV_BASE_URL, KMS_PROD_BASE_URL, NODE_ENV, KMS_ACCESS_KEY } =
  process.env

const env = NODE_ENV as Environment
const kmsBaseUrl = env === "development" ? KMS_DEV_BASE_URL : KMS_PROD_BASE_URL

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

    // Call the update activity route.
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
