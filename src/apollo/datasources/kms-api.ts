import { RESTDataSource, RequestOptions } from "apollo-datasource-rest"

import { NexusGenObjects, NexusGenEnums, NexusGenInputs } from "../typegen"
import type { Environment } from "../../types"

const { KMS_ACCESS_KEY, NODE_ENV, KMS_DEV_BASE_URL, KMS_PROD_BASE_URL } =
  process.env

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

export class KmsAPI extends RESTDataSource {
  constructor() {
    super()
    this.baseURL =
      (NODE_ENV as Environment) === "development"
        ? KMS_DEV_BASE_URL!
        : KMS_PROD_BASE_URL!

    this.willSendRequest = async (req: RequestOptions) => {
      // const token = await authClient.getIdToken()
      req.headers.set("x-access-key", KMS_ACCESS_KEY!)
      // req.headers.set('Authorization', token || '')
    }
  }

  // async createCryptoKey(): Promise<{ keyName: string }> {
  //   return this.post('/kms/createKey')
  // }

  /**
   * @dev The route to create blockchain wallet.
   */
  async createWallet(
    uid: string
  ): Promise<NexusGenObjects["CreateWalletResult"] | null> {
    return this.post("/wallet/create", { uid })
  }

  /**
   * @dev The route to get balance of a specific address.
   */
  async getBalance(address: string): Promise<{ balance: string }> {
    return this.get(`/wallet/balance/${encodeURIComponent(address)}`)
  }

  /// ***********************
  /// ***** Profile Contract *****
  /// ***********************

  /**
   * @dev The route to check if an address has specified role.
   * @param uid {string} - user auth uid
   * @param role {Role} - see Role enum
   */
  async hasRoleProfile(
    uid: string,
    role: NexusGenEnums["Role"]
  ): Promise<{ hasRole: boolean }> {
    return this.post(`/profiles/role/uid/${encodeURIComponent(uid)}`, {
      role,
    })
  }

  /**
   * @dev Call validate handle on the contract which will validate length and uniqueness.
   * @param handle {string}
   */
  async verifyHandle(handle: string): Promise<{ valid: boolean }> {
    return this.post("/profiles/verifyHandle", { handle })
  }

  /**
   * @dev Create profile nft.
   * @param uid: string - user auth uid
   * @param input see CreateProfileInput type
   */
  async createProfileNft(
    uid: string,
    input: NexusGenInputs["CreateProfileInput"]
  ): Promise<{
    token: NexusGenObjects["CreateProfileResult"]
  }> {
    return this.post(`/profiles/create/uid/${encodeURIComponent(uid)}`, input)
  }

  /**
   * @dev Update profile image.
   * @param uid {string} - user auth uid
   * @param input see UpdateProfileImageInput type
   */
  async updateProfileImage(
    uid: string,
    input: NexusGenInputs["UpdateProfileImageInput"]
  ): Promise<{
    token: NexusGenObjects["CreateProfileResult"]
  }> {
    const { profileId, imageURI, tokenURI } = input

    return this.post(
      `/profiles/update/profileId/${encodeURIComponent(
        profileId
      )}/uid/${encodeURIComponent(uid)}`,
      { imageURI, tokenURI }
    )
  }

  /**
   * @dev Set a profile as default.
   * @param uid {string} - user auth uid
   * @param profileId {number} - a profile token id
   */
  async setDefaultProfile(
    uid: string,
    profileId: number
  ): Promise<{ token: NexusGenObjects["CreateProfileResult"] }> {
    return this.post(
      `/profiles/default/profileId/${encodeURIComponent(
        profileId
      )}/uid/${encodeURIComponent(uid)}`
    )
  }

  /**
   * @dev Estimate gas for create profile nft.
   * @param uid: string - user auth uid
   * @param input see CreateProfileInput type
   */
  async estimateCreateProfileGas(
    uid: string,
    input: NexusGenInputs["CreateProfileInput"]
  ): Promise<{ gas: string }> {
    return this.post(
      `/profiles/estimateGas/uid/${encodeURIComponent(uid)}`,
      input
    )
  }

  /**
   * @dev Get user's default profile.
   * @param uid {string} - user auth uid
   */
  async getDefaultProfile(
    uid: string
  ): Promise<{ token: NexusGenObjects["CreateProfileResult"] }> {
    return this.get(`/profiles/default/uid/${encodeURIComponent(uid)}`)
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
  async createPublishNft({ key, data }: CreatePublishNftArgs): Promise<{
    token: NexusGenObjects["PublishToken"]
  }> {
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
  }: UpdatePublishNftArgs): Promise<{
    token: NexusGenObjects["PublishToken"]
  }> {
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
  ): Promise<{ tokens: NexusGenObjects["PublishToken"][] }> {
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
  ): Promise<{ tokens: NexusGenObjects["PublishToken"][] }> {
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
  ): Promise<{ token: NexusGenObjects["PublishToken"] }> {
    return this.get(`/publishes/publishId/${tokenId}`)
  }
}
