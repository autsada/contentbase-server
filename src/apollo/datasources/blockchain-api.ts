import { RESTDataSource, RequestOptions } from 'apollo-datasource-rest'

import { NexusGenObjects, NexusGenEnums } from '../typegen'
import { authClient } from '../../lib'
import type { Environment } from '../../types'

const { KMS_ACCESS_KEY, NODE_ENV, KMS_DEV_BASE_URL, KMS_PROD_BASE_URL } =
  process.env

export interface CreateProfileNftArgs {
  key: string
  data: {
    handle: string
    imageURI: string
    tokenURI: string
  }
}

export interface UpdateProfileImageArgs {
  key: string
  profileId: number
  data: {
    imageURI: string
    tokenURI: string
  }
}

export class BlockchainAPI extends RESTDataSource {
  constructor() {
    super()
    this.baseURL =
      (NODE_ENV as Environment) === 'development'
        ? KMS_DEV_BASE_URL!
        : KMS_PROD_BASE_URL!

    this.willSendRequest = async (req: RequestOptions) => {
      // const token = await authClient.getIdToken()
      req.headers.set('x-access-key', KMS_ACCESS_KEY!)
      // req.headers.set('Authorization', token || '')
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
  async getBalance(address: string): Promise<{ balance: string }> {
    return this.get(`/wallet/balance/${encodeURIComponent(address)}`)
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
    return this.post(`/tokens/check-role/key/${encodeURIComponent(key)}`, {
      role,
      address,
    })
  }

  /**
   * @dev Get all NFTs count of the contract
   */
  async getTokensCount(): Promise<{ tokensCount: number }> {
    return this.get('/tokens/total')
  }

  /**
   * @dev Get tokenURI of a token
   * @param tokenId {number}
   */
  async getTokenURI(tokenId: number): Promise<{ tokenURI: string }> {
    return this.get(`/tokens/tokenId/${encodeURIComponent(tokenId)}`)
  }

  /**
   * @dev A function to burn token
   * {key} - encrypted private key
   * {tokenId} - id of the token
   */
  async burnToken({
    key,
    tokenId,
  }: {
    key: string
    tokenId: number
  }): Promise<{ status: 'Ok' }> {
    return this.delete(
      `/tokens/burn/tokenId/${encodeURIComponent(
        tokenId
      )}/key/${encodeURIComponent(key)}`
    )
  }

  /**
   * @dev Create profile nft
   * {key} - encrypted private key
   * {data} - {handle, imageURI, tokenURI}
   */
  async createProfileNft({
    key,
    data,
  }: CreateProfileNftArgs): Promise<{ token: NexusGenObjects['Token'] }> {
    return this.post(`/profiles/create/key/${encodeURIComponent(key)}`, data)
  }

  /**
   * @dev Update profile image
   * {key} - encrypted private key
   * {profileId} - id of the profile
   * {data} - {imageURI, tokenURI}
   */
  async updateProfileImage({
    key,
    profileId,
    data,
  }: UpdateProfileImageArgs): Promise<{ token: NexusGenObjects['Token'] }> {
    return this.post(
      `/profiles/update/profileId/${encodeURIComponent(
        profileId
      )}/key/${encodeURIComponent(key)}`,
      data
    )
  }

  /**
   * @dev Set a profile as default
   * {key} - encrypted private key
   * {profileId} - id of the profile
   */
  async setDefaultProfile({
    key,
    profileId,
  }: {
    key: string
    profileId: number
  }): Promise<{ token: NexusGenObjects['Token'] }> {
    return this.post(
      `/profiles/default/profileId/${encodeURIComponent(
        profileId
      )}/key/${encodeURIComponent(key)}`
    )
  }

  /**
   * @dev Get profile token of the user
   * @dev Must provide token ids array
   */
  async getMyProfiles(
    key: string,
    tokenIds: number[]
  ): Promise<{ tokens: NexusGenObjects['Token'][] }> {
    return this.post(`/profiles/my-profiles/key/${encodeURIComponent(key)}`, {
      tokenIds,
    })
  }

  /**
   * @dev Get one profile by id
   */
  async getProfile(
    key: string,
    profileId: number
  ): Promise<{ token: NexusGenObjects['Token'] }> {
    return this.get(
      `/profiles/profileId/${encodeURIComponent(
        profileId
      )}/key/${encodeURIComponent(key)}`
    )
  }

  /**
   * @dev Get user's default profile
   * @param key - wallet's key
   */
  async getDefaultProfile(
    key: string
  ): Promise<{ token: NexusGenObjects['Token'] }> {
    return this.get(`/profiles/default/key/${encodeURIComponent(key)}`)
  }

  /**
   * @dev Call validate handle on the contract which will validate length and uniqueness
   */
  async verifyHandle(handle: string): Promise<{ isHandleUnique: boolean }> {
    return this.post('/profiles/verifyHandle', { handle })
  }

  // async createCryptoKey(): Promise<{ keyName: string }> {
  //   return this.post('/kms/createKey')
  // }

  async estimateCreateProfileGas(
    input: CreateProfileNftArgs
  ): Promise<{ gas: string }> {
    const { key, data } = input

    return this.post(
      `/profiles/estimateGas/key/${encodeURIComponent(key)}`,
      data
    )
  }
}
