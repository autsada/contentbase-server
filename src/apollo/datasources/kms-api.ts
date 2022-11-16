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
   * @dev Create profile nft.
   * @param uid: string - user auth uid
   * @param input see CreateProfileInput type
   */
  async createProfile(
    uid: string,
    input: NexusGenInputs["CreateProfileInput"]
  ): Promise<{ status: string }> {
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
  ): Promise<{ status: string }> {
    return this.post(`/profiles/update/uid/${encodeURIComponent(uid)}`, input)
  }

  /**
   * @dev Set a profile as default.
   * @param uid {string} - user auth uid
   * @param handle {string} - the handle to be set as default
   */
  async setDefaultProfile(
    uid: string,
    handle: string
  ): Promise<{ status: string }> {
    return this.post(`/profiles/default/uid/${encodeURIComponent(uid)}`, {
      handle,
    })
  }

  /**
   * @dev Follow.
   * @param uid {string} - user auth uid
   * @param input see FollowInput
   */
  async follow(
    uid: string,
    input: NexusGenInputs["FollowInput"]
  ): Promise<{ status: string }> {
    return this.post(`/profiles/follow/uid/${encodeURIComponent(uid)}`, input)
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
   * @param uid: string - user auth uid
   * @param input see CreateProfileInput type
   */
  async estimateGasCreateProfile(
    uid: string,
    input: NexusGenInputs["CreateProfileInput"]
  ): Promise<{ gas: string }> {
    return this.post(
      `/profiles/gas/profile/uid/${encodeURIComponent(uid)}`,
      input
    )
  }

  /**
   * @dev Estimate gas for follow operation.
   * @param uid: string - user auth uid
   * @param input see FollowInput type
   */
  async estimateGasFollow(
    uid: string,
    input: NexusGenInputs["FollowInput"]
  ): Promise<{ gas: string }> {
    return this.post(
      `/profiles/gas/follow/uid/${encodeURIComponent(uid)}`,
      input
    )
  }

  /**
   * @dev Get user's default profile.
   * @param uid {string} - user auth uid
   */
  async getDefaultProfile(
    uid: string
  ): Promise<{ token: NexusGenObjects["ProfileToken"] }> {
    return this.get(`/profiles/default/uid/${encodeURIComponent(uid)}`)
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
  async createPublish(
    uid: string,
    input: NexusGenInputs["CreatePublishInput"]
  ): Promise<{ status: string }> {
    return this.post(`/publishes/create/uid/${encodeURIComponent(uid)}`, input)
  }

  /**
   * @dev Update publish nft
   * @param uid {string} - user auth uid
   * @param input see UpdatePublishInput type
   */
  async updatePublish(
    uid: string,
    input: NexusGenInputs["UpdatePublishInput"]
  ): Promise<{ status: string }> {
    return this.post(`/publishes/update/uid/${encodeURIComponent(uid)}`, input)
  }

  /**
   * @dev Delete publish nft
   * @param uid {string} - user auth uid
   * @param publishId {number} - a publish token id
   * @param creatorId {number} - a profile token id
   */
  async deletePublish(
    uid: string,
    publishId: number,
    creatorId: number
  ): Promise<{ status: string }> {
    return this.post(`/publishes/delete/uid/${encodeURIComponent(uid)}`, {
      publishId,
      creatorId,
    })
  }

  /**
   * @dev Like a publish
   * @param uid {string} - user auth uid
   * @param publishId {number} - a publish token id
   * @param profileId {number} - a profile token id
   */
  async likePublish(
    uid: string,
    publishId: number,
    profileId: number
  ): Promise<{ status: string }> {
    return this.post(`/publishes/like/uid/${encodeURIComponent(uid)}`, {
      publishId,
      profileId,
    })
  }

  /**
   * @dev DisLike a publish
   * @param uid {string} - user auth uid
   * @param publishId {number} - a publish token id
   * @param profileId {number} - a profile token id
   */
  async disLikePublish(
    uid: string,
    publishId: number,
    profileId: number
  ): Promise<{ status: string }> {
    return this.post(`/publishes/disLike/uid/${encodeURIComponent(uid)}`, {
      publishId,
      profileId,
    })
  }

  /**
   * @dev Create comment nft
   * @param uid {string} - user auth uid
   * @param input see CreateCommentInput type
   */
  async createComment(
    uid: string,
    input: NexusGenInputs["CreateCommentInput"]
  ): Promise<{ status: string }> {
    return this.post(
      `/publishes/comment/create/uid/${encodeURIComponent(uid)}`,
      input
    )
  }

  /**
   * @dev Update comment nft
   * @param uid {string} - user auth uid
   * @param input see UpdateCommentInput type
   */
  async updateComment(
    uid: string,
    input: NexusGenInputs["UpdateCommentInput"]
  ): Promise<{ status: string }> {
    return this.post(
      `/publishes/comment/update/uid/${encodeURIComponent(uid)}`,
      input
    )
  }

  /**
   * @dev Delete comment nft
   * @param uid {string} - user auth uid
   * @param commentId {number} - a comment token id
   * @param creatorId {number} - a profile token id
   */
  async deleteComment(
    uid: string,
    commentId: number,
    creatorId: number
  ): Promise<{ status: string }> {
    return this.post(
      `/publishes/comment/delete/uid/${encodeURIComponent(uid)}`,
      {
        commentId,
        creatorId,
      }
    )
  }

  /**
   * @dev Like a comment
   * @param uid {string} - user auth uid
   * @param commentId {number} - a comment token id
   * @param profileId {number} - a profile token id
   */
  async likeComment(
    uid: string,
    commentId: number,
    profileId: number
  ): Promise<{ status: string }> {
    return this.post(`/publishes/comment/like/uid/${encodeURIComponent(uid)}`, {
      commentId,
      profileId,
    })
  }

  /**
   * @dev DisLike a comment
   * @param uid {string} - user auth uid
   * @param commentId {number} - a comment token id
   * @param profileId {number} - a profile token id
   */
  async disLikeComment(
    uid: string,
    commentId: number,
    profileId: number
  ): Promise<{ status: string }> {
    return this.post(
      `/publishes/comment/disLike/uid/${encodeURIComponent(uid)}`,
      {
        commentId,
        profileId,
      }
    )
  }

  /**
   * @dev Estimate gas for creating a publish nft.
   * @param uid: string - user auth uid
   * @param input see CreateProfileInput type
   */
  async estimateGasCreatePublish(
    uid: string,
    input: NexusGenInputs["CreatePublishInput"]
  ): Promise<{ gas: string }> {
    return this.post(
      `/publishes/gas/publish/create/uid/${encodeURIComponent(uid)}`,
      input
    )
  }

  /**
   * @dev Estimate gas to like a publish.
   * @param uid: string - user auth uid
   * @param publishId {number} - a publish token id
   * @param profileId {number} - a profile token id
   */
  async estimateGasLikePublish(
    uid: string,
    publishId: number,
    profileId: number
  ): Promise<{ gas: string }> {
    return this.post(
      `/publishes/gas/publish/like/uid/${encodeURIComponent(uid)}`,
      { publishId, profileId }
    )
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
