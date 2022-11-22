import { KmsAPI } from "./datasources/kms-api"
import { WebhooksAPI } from "./datasources/webhooks-api"

export interface Context {
  dataSources: {
    kmsAPI: KmsAPI
    webhooksApi: WebhooksAPI
  }
  idToken: string | undefined
}
