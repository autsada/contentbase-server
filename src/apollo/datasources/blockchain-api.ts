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
    tokenURI: string
    imageURI?: string | null
  }
}

export interface CreatePublishNftArgs {
  key: string
  data: {
    tokenURI: string
    profileId: number
    imageURI: string
    contentURI: string
  }
}

export interface UpdatePublishNftArgs {
  key: string
  publishId: number
  data: {
    tokenURI: string
    imageURI?: string | null
    contentURI?: string | null
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

  /// ***********************
  /// ***** Profile Token *****
  /// ***********************

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
   * @dev Get profile tokens of the user
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
    profileId: number
  ): Promise<{ token: NexusGenObjects['Token'] }> {
    return this.get(`/profiles/profileId/${encodeURIComponent(profileId)}`)
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

  // ======================= //

  /// ***********************
  /// ***** Publish Token *****
  /// ***********************

  /**
   * @dev Create publish nft
   * {key} - encrypted private key
   * {data} - {tokenURI, profileId, imageURI, contentURI}
   */
  async createPublishNft({
    key,
    data,
  }: CreatePublishNftArgs): Promise<{ token: NexusGenObjects['Token'] }> {
    return this.post(`/publishes/create/key/${encodeURIComponent(key)}`, data)
  }

  /**
   * @dev Update publish nft
   * {key} - encrypted private key
   * {publishId} - a token id of the publish to be updated
   * {data} - {tokenURI, imageURI, contentURI}
   */
  async updatePublishNft({
    key,
    publishId,
    data,
  }: UpdatePublishNftArgs): Promise<{ token: NexusGenObjects['Token'] }> {
    return this.post(
      `/publishes/update/publishId/${publishId}/key/${encodeURIComponent(key)}`,
      data
    )
  }

  /**
   * @dev Get publish tokens of the user
   * @dev Must provide token ids array
   */
  async getMyPublishes(
    key: string,
    tokenIds: number[]
  ): Promise<{ tokens: NexusGenObjects['Token'][] }> {
    return this.post(`/publishes/my-publishes/key/${encodeURIComponent(key)}`, {
      tokenIds,
    })
  }

  /**
   * @dev Get publishes
   * @dev Must provide token ids array
   */
  async getPublishes(
    tokenIds: number[]
  ): Promise<{ tokens: NexusGenObjects['Token'][] }> {
    return this.post(`/publishes/get`, {
      tokenIds,
    })
  }

  /**
   * @dev Get one publish
   * @dev Must provide token id
   */
  async getPublish(
    tokenId: number
  ): Promise<{ token: NexusGenObjects['Token'] }> {
    return this.get(`/publishes/publishId/${tokenId}`)
  }
}
