import { UserRecord } from 'firebase-admin/auth'

import { FirestoreAPI } from '../apollo/datasources/firestore-api'
import { BlockchainAPI } from '../apollo/datasources/blockchain-api'
import { WebhooksAPI } from '../apollo/datasources/webhooks-api'

export interface Context {
  dataSources: {
    firestoreAPI: FirestoreAPI
    blockchainAPI: BlockchainAPI
    webhooksApi: WebhooksAPI
  }
  user: UserRecord | null
}
