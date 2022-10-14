import { UserRecord } from "firebase-admin/auth"

import { FirestoreAPI } from "./datasources/firestore-api"
import { KmsAPI } from "./datasources/kms-api"
import { BlockchainAPI } from "./datasources/blockchain-api"
import { WebhooksAPI } from "./datasources/webhooks-api"

export interface Context {
  dataSources: {
    firestoreAPI: FirestoreAPI
    kmsAPI: KmsAPI
    blockchainAPI: BlockchainAPI
    webhooksApi: WebhooksAPI
  }
  user: UserRecord | null
}
