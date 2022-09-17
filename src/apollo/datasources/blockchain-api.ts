import { RESTDataSource, RequestOptions } from 'apollo-datasource-rest'

import { NexusGenObjects, NexusGenEnums } from '../typegen'
import type { Environment } from '../../types'

const { KMS_ACCESS_KEY, NODE_ENV, KMS_DEV_BASE_URL, KMS_PROD_BASE_URL } =
  process.env

export interface CreateProfileNftArgs {
  key: string
  uid: string
  handle: string
  imageURI: string
  isDefault: boolean
}

export class BlockchainAPI extends RESTDataSource {
  constructor() {
    super()
    this.baseURL =
      (NODE_ENV as Environment) === 'production' ||
      (NODE_ENV as Environment) === 'staging'
        ? KMS_PROD_BASE_URL
        : KMS_DEV_BASE_URL!
    this.willSendRequest = (req: RequestOptions) => {
      req.headers.set('authorization', KMS_ACCESS_KEY!)
    }
  }

  /**
   * @dev Create blockchain wallet
   */
  async createWallet(): Promise<
    (NexusGenObjects['CreateWalletResult'] & { key: string }) | null
  > {
    return this.post('/wallet/create')
  }

  /**
   * @dev Get balance of a specific address
   */
  async getMyBalance(address: string): Promise<{ balance: string }> {
    return this.get(`/wallet/balance/${encodeURIComponent(address)}`)
  }

  /**
   * @dev Call validate handle on the contract which will validate length and uniqueness
   */
  async verifyHandle(handle: string): Promise<{ isHandleUnique: boolean }> {
    return this.post('/profiles/verifyHandle', { handle })
  }

  /**
   * @dev Get all profiles count of the contract
   */
  async getTotalProfiles(): Promise<{ profilesCount: number }> {
    return this.get('/profiles/total')
  }

  /**
   * @dev Get profiles of an address
   */
  async getMyProfiles(
    address: string,
    key: string
  ): Promise<{ profiles: NexusGenObjects['Profile'][] }> {
    return this.get(
      `/profiles/my-profiles/address/${encodeURIComponent(
        address
      )}/key/${encodeURIComponent(key)}`
    )
  }

  /**
   * @dev Create profile nft
   */
  async createProfileNft({
    key,
    uid,
    handle,
    imageURI,
    isDefault,
  }: CreateProfileNftArgs): Promise<{ profileId: number }> {
    try {
      const result = await this.post('/profiles/create', {
        key,
        uid,
        handle,
        imageURI,
        isDefault,
      })

      return result
    } catch (error) {
      throw error
    }
  }

  /**
   * @dev Check if an address has specified role
   */
  async hasRole({
    role,
    address,
    key,
  }: {
    role: NexusGenEnums['Role']
    address: string
    key: string
  }): Promise<{ hasRole: boolean }> {
    return this.post(`/profiles/check-role`, { role, address, key })
  }

  // async createCryptoKey(): Promise<{ keyName: string }> {
  //   return this.post('/kms/createKey')
  // }

  async estimateCreateProfileGas(
    input: CreateProfileNftArgs
  ): Promise<{ gas: string }> {
    const { key, uid, handle, imageURI, isDefault } = input

    return this.post(`/profiles/estimateGas`, {
      key,
      uid,
      handle,
      imageURI,
      isDefault,
    })
  }
}
