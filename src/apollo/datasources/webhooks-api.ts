import { RESTDataSource, WillSendRequestOptions } from "@apollo/datasource-rest"
// KeyValueCache is the type of Apollo server's default cache
import type { KeyValueCache } from "@apollo/utils.keyvaluecache"

const { ALCHEMY_WEBHOOK_ID, ALCHEMY_WEBHOOK_AUTH_TOKEN } = process.env

export class WebhooksAPI extends RESTDataSource {
  override baseURL = "https://dashboard.alchemyapi.io/api/"

  constructor(options: { cache: KeyValueCache }) {
    super(options) // this sends our server's `cache` through
  }

  protected override async willSendRequest(
    req: WillSendRequestOptions
  ): Promise<void> {
    req.headers["x-alchemy-token"] = ALCHEMY_WEBHOOK_AUTH_TOKEN || ""
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

    return this.patch("update-webhook-addresses", { body })
  }
}
