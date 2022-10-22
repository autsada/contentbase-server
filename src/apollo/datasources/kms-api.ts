import { RESTDataSource, RequestOptions } from "apollo-datasource-rest"

import { NexusGenObjects, NexusGenEnums, NexusGenInputs } from "../typegen"
import type { Environment } from "../../types"

const { KMS_ACCESS_KEY, NODE_ENV, KMS_DEV_BASE_URL, KMS_PROD_BASE_URL } =
  process.env
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

  // =========================== //
  // These below functions are for only admin role, and will be used in development only, in production admin will connect to the blockchain directly from the UI for more security.
  async setProfileForPublish(
    profileContractAddress: string
  ): Promise<{ status: "Ok" }> {
    return this.post("/admin/set/publish-profile", { profileContractAddress })
  }

  async setLikeForPublish(
    likeContractAddress: string
  ): Promise<{ status: "Ok" }> {
    return this.post("/admin/set/publish-like", { likeContractAddress })
  }

  async setProfileForFollow(
    profileContractAddress: string
  ): Promise<{ status: "Ok" }> {
    return this.post("/admin/set/follow-profile", { profileContractAddress })
  }

  async setProfileForLike(
    profileContractAddress: string
  ): Promise<{ status: "Ok" }> {
    return this.post("/admin/set/like-profile", { profileContractAddress })
  }

  async setPublishForLike(
    publishContractAddress: string
  ): Promise<{ status: "Ok" }> {
    return this.post("/admin/set/like-publish", { publishContractAddress })
  }

  async setContractOwnerAddress(
    ownerAddress: string
  ): Promise<{ status: "Ok" }> {
    return this.post("/admin/set/owner-address", { ownerAddress })
  }

  async withdrawFunds(): Promise<{ status: "Ok" }> {
    return this.post("/admin/withdraw")
  }

  async setLikeFee(fee: number): Promise<{ status: "Ok" }> {
    return this.post("/admin/set/like-fee", { fee })
  }

  async setPlatformFee(fee: number): Promise<{ status: "Ok" }> {
    return this.post("/admin/set/platform-fee", { fee })
  }

  async getOwnerAddress(): Promise<{ address: string }> {
    return this.get("/admin/owner-address")
  }

  async getContactBalance(): Promise<{ balance: number }> {
    return this.get("/admin/balance")
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
    const { profileId, imageURI } = input

    return this.post(
      `/profiles/update/profileId/${encodeURIComponent(
        profileId
      )}/uid/${encodeURIComponent(uid)}`,
      { imageURI }
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
   * @dev Estimate gas for creating a profile nft.
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
   * @dev The route to check if an address has specified role.
   * @param uid {string} - user auth uid
   * @param role {Role} - see Role enum
   */
  async hasRolePublish(
    uid: string,
    role: NexusGenEnums["Role"]
  ): Promise<{ hasRole: boolean }> {
    return this.post(`/publishes/role/uid/${encodeURIComponent(uid)}`, {
      role,
    })
  }

  /**
   * @dev Create publish nft
   * @param uid {string} - user auth uid
   * @param input see CreatePublishInput type
   */
  async createPublishNft(
    uid: string,
    input: NexusGenInputs["CreatePublishInput"]
  ): Promise<{
    token: NexusGenObjects["CreatePublishResult"]
  }> {
    return this.post(`/publishes/create/uid/${encodeURIComponent(uid)}`, input)
  }

  /**
   * @dev Update publish nft
   * @param uid {string} - user auth uid
   * @param input see UpdatePublishInput type
   */
  async updatePublishNft(
    uid: string,
    input: NexusGenInputs["UpdatePublishInput"]
  ): Promise<{
    token: NexusGenObjects["CreatePublishResult"]
  }> {
    const {
      publishId,
      creatorId,
      imageURI,
      contentURI,
      metadataURI,
      title,
      description,
      primaryCategory,
      secondaryCategory,
      tertiaryCategory,
    } = input

    return this.post(
      `/publishes/update/publishId/${encodeURIComponent(
        publishId
      )}/uid/${encodeURIComponent(uid)}`,
      {
        creatorId,
        imageURI,
        contentURI,
        metadataURI,
        title,
        description,
        primaryCategory,
        secondaryCategory,
        tertiaryCategory,
      }
    )
  }

  /**
   * @dev Delete publish nft
   * @param uid {string} - user auth uid
   * @param publishId {number} - a publish token id
   */
  async burnPublishNft(
    uid: string,
    publishId: number
  ): Promise<{ status: number }> {
    return this.delete(
      `/publishes/delete/publishId/${encodeURIComponent(
        publishId
      )}/uid/${encodeURIComponent(uid)}`
    )
  }

  /**
   * @dev Get publish tokens of the user
   * @dev Must provide token ids array
   */
  async getMyPublishes(
    uid: string,
    tokenIds: number[]
  ): Promise<{ tokens: NexusGenObjects["FetchPublishResult"][] }> {
    return this.post(`/publishes/my-publishes/uid/${encodeURIComponent(uid)}`, {
      tokenIds,
    })
  }

  /**
   * @dev Get publishes
   * @dev Must provide token ids array
   */
  async getPublishes(
    tokenIds: number[]
  ): Promise<{ tokens: NexusGenObjects["FetchPublishResult"][] }> {
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
  ): Promise<{ token: NexusGenObjects["FetchPublishResult"] }> {
    return this.get(`/publishes/publishId/${tokenId}`)
  }

  /**
   * @dev Get total publishes count
   */
  async totalPublishes(): Promise<{ total: number }> {
    return this.get(`/publishes/total`)
  }

  /**
   * @dev Estimate gas for creating a publish nft.
   * @param uid: string - user auth uid
   * @param input see CreateProfileInput type
   */
  async estimateCreatePublishGas(
    uid: string,
    input: NexusGenInputs["CreatePublishInput"]
  ): Promise<{ gas: string }> {
    return this.post(
      `/publishes/estimateGas/uid/${encodeURIComponent(uid)}`,
      input
    )
  }

  /// ***********************
  /// ***** Follow Contract *****
  /// ***********************

  /**
   * @dev The route to check if an address has specified role.
   * @param uid {string} - user auth uid
   * @param role {Role} - see Role enum
   */
  async hasRoleFollow(
    uid: string,
    role: NexusGenEnums["Role"]
  ): Promise<{ hasRole: boolean }> {
    return this.post(`/follows/role/uid/${encodeURIComponent(uid)}`, {
      role,
    })
  }

  /**
   * @dev follow other profile (create follow nft)
   * @param uid {string} - user auth uid
   * @param input see CreateFollowInput type
   */
  async createFollowNft(
    uid: string,
    input: NexusGenInputs["CreateFollowInput"]
  ): Promise<{
    token: NexusGenObjects["CreateFollowResult"]
  }> {
    return this.post(`/follows/create/uid/${encodeURIComponent(uid)}`, input)
  }

  /**
   * @dev unFollow (delete follow nft)
   * @param uid {string} - user auth uid
   * @param tokenId {number} - a follow token id
   */
  async burnFollowNft(
    uid: string,
    tokenId: number
  ): Promise<{ status: number }> {
    return this.delete(
      `/follows/delete/tokenId/${encodeURIComponent(
        tokenId
      )}/uid/${encodeURIComponent(uid)}`
    )
  }

  /**
   * @dev get following count of a specific profile
   */
  async getFollowingCount(profileId: number): Promise<{ count: number }> {
    return this.get(
      `/follows/following/profileId/${encodeURIComponent(profileId)}`
    )
  }

  /**
   * @dev get followers count of a specific profile
   */
  async getFollowersCount(profileId: number): Promise<{ count: number }> {
    return this.get(
      `/follows/followers/profileId/${encodeURIComponent(profileId)}`
    )
  }

  /**
   * @dev fetch followers nft by provided token ids
   */
  async fetchFollowers(
    tokenIds: number[]
  ): Promise<{ tokens: NexusGenObjects["CreateFollowResult"][] }> {
    return this.post(`/follows`, { tokenIds })
  }

  /**
   * @dev Estimate gas for creating a follow nft.
   * @param uid: string - user auth uid
   * @param input see CreateFollowInput type
   */
  async estimateCreateFollowGas(
    uid: string,
    input: NexusGenInputs["CreateFollowInput"]
  ): Promise<{ gas: string }> {
    return this.post(
      `/follows/estimateGas/uid/${encodeURIComponent(uid)}`,
      input
    )
  }

  /// ***********************
  /// ***** Like Contract *****
  /// ***********************

  /**
   * @dev The route to check if an address has specified role.
   * @param uid {string} - user auth uid
   * @param role {Role} - see Role enum
   */
  async hasRoleLike(
    uid: string,
    role: NexusGenEnums["Role"]
  ): Promise<{ hasRole: boolean }> {
    return this.post(`/likes/role/uid/${encodeURIComponent(uid)}`, {
      role,
    })
  }

  /**
   * @dev like a publish (create like nft)
   * @param uid {string} - user auth uid
   * @param input see CreateLikeInput type
   */
  async createLikeNft(
    uid: string,
    input: NexusGenInputs["CreateLikeInput"]
  ): Promise<{
    token: NexusGenObjects["CreateLikeResult"]
  }> {
    return this.post(`/likes/create/uid/${encodeURIComponent(uid)}`, input)
  }

  /**
   * @dev unLike (delete like nft)
   * @param uid {string} - user auth uid
   * @param tokenId {number} - a like token id
   */
  async burnLikeNft(uid: string, tokenId: number): Promise<{ status: number }> {
    return this.delete(
      `/likes/delete/tokenId/${encodeURIComponent(
        tokenId
      )}/uid/${encodeURIComponent(uid)}`
    )
  }

  /**
   * @dev get like fee
   */
  async getLikeFee(): Promise<{ fee: number }> {
    return this.get(`/likes/fee/like-fee`)
  }

  /**
   * @dev get platform fee
   */
  async getPlatformFee(): Promise<{ fee: number }> {
    return this.get(`/likes/fee/platform-fee`)
  }

  /**
   * @dev Estimate gas for creating a like nft.
   * @param uid: string - user auth uid
   * @param input see CreateLikeInput type
   */
  async estimateCreateLikeGas(
    uid: string,
    input: NexusGenInputs["CreateLikeInput"]
  ): Promise<{ gas: string }> {
    return this.post(`/likes/estimateGas/uid/${encodeURIComponent(uid)}`, input)
  }
}
