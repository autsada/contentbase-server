import type { Request, Response } from 'express'

import { pubsub } from '../apollo/pubsub'
import { isValidSignatureForStringBody } from '../lib/utils/helpers'
import type { NexusGenObjects } from '../apollo/typegen'

export async function onAddressUpdated(req: Request, res: Response) {
  try {
    // Get signature from headers
    const signature = req.headers['x-alchemy-signature']

    // Get raw body from req
    const rawBody = req.rawBody

    if (!signature || !rawBody) throw new Error('Invalid request')

    // Validate signature
    const isValid = isValidSignatureForStringBody(rawBody, signature as string)

    if (!isValid) throw new Error('Request corrupted in transit.')

    const body = req.body as NexusGenObjects['WebHookRequestBody']
    const activity = body.event.activity[0]

    if (activity) {
      // Publish the activity
      pubsub.publish<NexusGenObjects['AddressSubscriptionResult']>(
        'blockchain-notifications',
        {
          event: activity.category,
          fromAddress: activity.fromAddress,
          toAddress: activity.toAddress,
        }
      )
    }

    res.status(200).end()
  } catch (error) {
    res.status(500).end()
  }
}
