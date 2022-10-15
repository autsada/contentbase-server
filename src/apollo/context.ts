import { UserRecord } from "firebase-admin/auth"

import { FirestoreAPI } from "./datasources/firestore-api"
import { KmsAPI } from "./datasources/kms-api"
import { WebhooksAPI } from "./datasources/webhooks-api"

export interface Context {
  dataSources: {
    firestoreAPI: FirestoreAPI
    kmsAPI: KmsAPI
    webhooksApi: WebhooksAPI
  }
  user: UserRecord | null
}
