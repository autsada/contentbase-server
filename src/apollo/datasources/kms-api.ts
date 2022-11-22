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
      // This token will be used to verify user.
      // req.headers.set("id-token", this.context.idToken || "")
    }
  }

  // async createCryptoKey(): Promise<{ keyName: string }> {
  //   return this.post('/kms/createKey')
  // }

  /**
   * @dev The route to create blockchain wallet.
   */
  async createWallet(): Promise<NexusGenObjects["CreateWalletResult"] | null> {
    return this.post("/wallet/create")
  }

  /**
   * @dev The route to get balance of a specific address.
   */
  async getBalance(address: string): Promise<{ balance: string }> {
    return this.get(`/wallet/balance/${encodeURIComponent(address)}`)
  }

  // =========================== //
  // These below functions are for only admin role, and will be used in development only, in production admin will connect to the blockchain directly from the UI for more security.
  async setOwnerAddress(ownerAddress: string): Promise<{ status: string }> {
    return this.post("/admin/address/owner", { ownerAddress })
  }

  async setProfileAddress(
    contractAddress: string
  ): Promise<{ status: string }> {
    return this.post("/admin/address/profile", { contractAddress })
  }

  async setLikeFee(fee: number): Promise<{ status: string }> {
    return this.post("/admin/fee/like", { fee })
  }

  async setPlatformFee(fee: number): Promise<{ status: string }> {
    return this.post("/admin/fee/platform", { fee })
  }

  async withdrawFunds(): Promise<{ status: string }> {
    return this.post("/admin/funds/withdraw")
  }

  /// ***********************
  /// ***** Profile Contract *****
  /// ***********************

  /**
   * @dev The route to check if an address has specified role.
   * @param role {Role} - see Role enum
   */
  async hasRoleProfile(
    role: NexusGenEnums["Role"]
  ): Promise<{ hasRole: boolean }> {
    return this.post(`/profiles/role`, {
      role,
    })
  }

  /**
   * @dev Create profile nft.
   * @param input see CreateProfileInput type
   */
  async createProfile(
    input: NexusGenInputs["CreateProfileInput"]
  ): Promise<{ status: string }> {
    return this.post(`/profiles/create`, input)
  }

  /**
   * @dev Update profile image.
   * @param input see UpdateProfileImageInput type
   */
  async updateProfileImage(
    input: NexusGenInputs["UpdateProfileImageInput"]
  ): Promise<{ status: string }> {
    return this.post(`/profiles/update`, input)
  }

  /**
   * @dev Set a profile as default.
   * @param handle {string} - the handle to be set as default
   */
  async setDefaultProfile(handle: string): Promise<{ status: string }> {
    return this.post(`/profiles/default`, {
      handle,
    })
  }

  /**
   * @dev Follow.
   * @param input see FollowInput
   */
  async follow(
    input: NexusGenInputs["FollowInput"]
  ): Promise<{ status: string }> {
    return this.post(`/profiles/follow`, input)
  }

  /**
   * @dev Call validate handle on the contract which will validate length and uniqueness.
   * @param handle {string}
   */
  async verifyHandle(handle: string): Promise<{ valid: boolean }> {
    return this.post("/profiles/handle/verify", { handle })
  }

  /**
   * @dev Estimate gas for creating a profile nft.
   * @param input see CreateProfileInput type
   */
  async estimateGasCreateProfile(
    input: NexusGenInputs["CreateProfileInput"]
  ): Promise<{ gas: string }> {
    return this.post(`/profiles/gas/profile`, input)
  }

  /**
   * @dev Estimate gas for follow operation.
   * @param input see FollowInput type
   */
  async estimateGasFollow(
    input: NexusGenInputs["FollowInput"]
  ): Promise<{ gas: string }> {
    return this.post(`/profiles/gas/follow`, input)
  }

  /**
   * @dev Get user's default profile.
   */
  async getDefaultProfile(): Promise<{
    token: NexusGenObjects["ProfileToken"]
  }> {
    return this.get(`/profiles/default`)
  }

  /**
   * @dev Get profile/follow nft token uri.
   * @param tokenId {number}
   */
  async getTokenURI(tokenId: number): Promise<{ uri: string }> {
    return this.get(
      `/profiles/token-uri/tokenId/${encodeURIComponent(tokenId)}`
    )
  }

  // ======================= //

  /// ***********************
  /// ***** Publish Token *****
  /// ***********************

  /**
   * @dev The route to check if an address has specified role.
   * @param role {Role} - see Role enum
   */
  async hasRolePublish(
    role: NexusGenEnums["Role"]
  ): Promise<{ hasRole: boolean }> {
    return this.post(`/publishes/role`, {
      role,
    })
  }

  /**
   * @dev Create publish nft
   * @param input see CreatePublishInput type
   */
  async createPublish(
    input: NexusGenInputs["CreatePublishInput"]
  ): Promise<{ status: string }> {
    return this.post(`/publishes/create`, input)
  }

  /**
   * @dev Update publish nft
   * @param input see UpdatePublishInput type
   */
  async updatePublish(
    input: NexusGenInputs["UpdatePublishInput"]
  ): Promise<{ status: string }> {
    return this.post(`/publishes/update`, input)
  }

  /**
   * @dev Delete publish nft
   * @param publishId {number} - a publish token id
   * @param creatorId {number} - a profile token id
   */
  async deletePublish(
    publishId: number,
    creatorId: number
  ): Promise<{ status: string }> {
    return this.post(`/publishes/delete`, {
      publishId,
      creatorId,
    })
  }

  /**
   * @dev Like a publish
   * @param publishId {number} - a publish token id
   * @param profileId {number} - a profile token id
   */
  async likePublish(
    publishId: number,
    profileId: number
  ): Promise<{ status: string }> {
    return this.post(`/publishes/like`, {
      publishId,
      profileId,
    })
  }

  /**
   * @dev DisLike a publish
   * @param publishId {number} - a publish token id
   * @param profileId {number} - a profile token id
   */
  async disLikePublish(
    publishId: number,
    profileId: number
  ): Promise<{ status: string }> {
    return this.post(`/publishes/disLike`, {
      publishId,
      profileId,
    })
  }

  /**
   * @dev Create comment nft
   * @param input see CreateCommentInput type
   */
  async createComment(
    input: NexusGenInputs["CreateCommentInput"]
  ): Promise<{ status: string }> {
    return this.post(`/publishes/comment/create`, input)
  }

  /**
   * @dev Update comment nft
   * @param input see UpdateCommentInput type
   */
  async updateComment(
    input: NexusGenInputs["UpdateCommentInput"]
  ): Promise<{ status: string }> {
    return this.post(`/publishes/comment/update`, input)
  }

  /**
   * @dev Delete comment nft
   * @param commentId {number} - a comment token id
   * @param creatorId {number} - a profile token id
   */
  async deleteComment(
    commentId: number,
    creatorId: number
  ): Promise<{ status: string }> {
    return this.post(`/publishes/comment/delete`, {
      commentId,
      creatorId,
    })
  }

  /**
   * @dev Like a comment
   * @param commentId {number} - a comment token id
   * @param profileId {number} - a profile token id
   */
  async likeComment(
    commentId: number,
    profileId: number
  ): Promise<{ status: string }> {
    return this.post(`/publishes/comment/like`, {
      commentId,
      profileId,
    })
  }

  /**
   * @dev DisLike a comment
   * @param commentId {number} - a comment token id
   * @param profileId {number} - a profile token id
   */
  async disLikeComment(
    commentId: number,
    profileId: number
  ): Promise<{ status: string }> {
    return this.post(`/publishes/comment/disLike`, {
      commentId,
      profileId,
    })
  }

  /**
   * @dev Estimate gas for creating a publish nft.
   * @param input see CreateProfileInput type
   */
  async estimateGasCreatePublish(
    input: NexusGenInputs["CreatePublishInput"]
  ): Promise<{ gas: string }> {
    return this.post(`/publishes/gas/publish/create`, input)
  }

  /**
   * @dev Estimate gas to like a publish.
   * @param publishId {number} - a publish token id
   * @param profileId {number} - a profile token id
   */
  async estimateGasLikePublish(
    publishId: number,
    profileId: number
  ): Promise<{ gas: string }> {
    return this.post(`/publishes/gas/publish/like`, { publishId, profileId })
  }

  /**
   * @dev Get one publish by provided token id
   */
  async getPublish(
    tokenId: number
  ): Promise<{ token: NexusGenObjects["PublishToken"] }> {
    return this.get(`/publishes/publishId/${encodeURIComponent(tokenId)}`)
  }

  /**
   * @dev Get one comment by provided token id
   */
  async getComment(
    tokenId: number
  ): Promise<{ token: NexusGenObjects["CommentToken"] }> {
    return this.get(
      `/publishes/comment/commentId/${encodeURIComponent(tokenId)}`
    )
  }

  /**
   * @dev Get publish/comment nft token uri.
   * @param tokenId {number}
   */
  async getPublishTokenURI(tokenId: number): Promise<{ uri: string }> {
    return this.get(
      `/publishes/token-uri/tokenId/${encodeURIComponent(tokenId)}`
    )
  }

  async getOwnerAddress(): Promise<{ address: string }> {
    return this.get("/publishes/address/owner")
  }

  async getProfileAddress(): Promise<{ address: string }> {
    return this.get("/publishes/address/profile")
  }

  async getLikeFee(): Promise<{ fee: number }> {
    return this.get("/publishes/fee/like")
  }

  async getPlatformFee(): Promise<{ fee: number }> {
    return this.get("/publishes/fee/platform")
  }
}
