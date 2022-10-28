import { UserRecord } from "firebase-admin/auth"

import { KmsAPI } from "./datasources/kms-api"
import { WebhooksAPI } from "./datasources/webhooks-api"

export interface Context {
  dataSources: {
    kmsAPI: KmsAPI
    webhooksApi: WebhooksAPI
  }
  user: UserRecord | null
}
