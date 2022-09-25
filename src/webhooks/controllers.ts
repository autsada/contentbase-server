import type { Request, Response } from 'express'

import {
  db,
  accountsCollection,
  activitiesCollection,
  searchDocByField,
  updateDocById,
  isValidSignatureForStringBody,
} from '../lib'
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

    console.log('isValid -->', isValid)
    if (!isValid) throw new Error('Request corrupted in transit.')

    const body = req.body as NexusGenObjects['WebHookRequestBody']
    const activity = body.event.activity[0]

    console.log('activity -->', activity)
    if (activity) {
      // Find users that relate to the activity
      const fromAddress = activity.fromAddress.toLowerCase()
      const toAddress = activity.toAddress.toLowerCase()

      const fromUserDocs = await searchDocByField<NexusGenObjects['Account']>({
        db,
        collectionName: accountsCollection,
        fieldName: 'address',
        fieldValue: fromAddress,
      })

      const toUserDocs = await searchDocByField<NexusGenObjects['Account']>({
        db,
        collectionName: accountsCollection,
        fieldName: 'address',
        fieldValue: toAddress,
      })

      // Combine the users array
      const relatedUsers = [...fromUserDocs, ...toUserDocs]

      console.log('users -->', relatedUsers)
      // Update activity of these users in Firestore
      // Use Promise.allSettled because if one item rejects it will not reject the rest
      await Promise.allSettled(
        relatedUsers.map((user) => {
          return updateDocById<Omit<NexusGenObjects['AddressActivity'], 'id'>>({
            db,
            collectionName: activitiesCollection,
            docId: user.id,
            data: {
              event: activity.category,
              fromAddress,
              toAddress,
              value: activity.value,
              isAcknowledged: false,
            },
          })
        })
      )
    }

    console.log('Done -->')
    res.status(200).end()
  } catch (error) {
    res.status(500).end()
  }
}
