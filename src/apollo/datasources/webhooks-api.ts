import { RESTDataSource, RequestOptions } from 'apollo-datasource-rest'

const { ALCHEMY_WEBHOOK_ID, ALCHEMY_WEBHOOK_AUTH_TOKEN } = process.env

export interface CreateProfileNftArgs {
  key: string
  uid: string
  handle: string
  imageURI: string
  isDefault: boolean
}

export class WebhooksAPI extends RESTDataSource {
  constructor() {
    super()
    this.baseURL = 'https://dashboard.alchemyapi.io/api'
    this.willSendRequest = (req: RequestOptions) => {
      req.headers.set('x-alchemy-token', ALCHEMY_WEBHOOK_AUTH_TOKEN!)
    }
  }

  /**
   * @dev Add address
   */
  async addAddress(address: string): Promise<{}> {
    const body = {
      webhook_id: ALCHEMY_WEBHOOK_ID,
      addresses_to_add: [address],
      addresses_to_remove: [],
    }

    return this.patch('/update-webhook-addresses', body)
  }
}
