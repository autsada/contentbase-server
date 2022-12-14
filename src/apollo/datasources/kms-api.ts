import { RESTDataSource, WillSendRequestOptions } from "@apollo/datasource-rest"
// KeyValueCache is the type of Apollo server's default cache
import type { KeyValueCache } from "@apollo/utils.keyvaluecache"

import { NexusGenObjects, NexusGenEnums, NexusGenInputs } from "../typegen"
import type { Environment } from "../../types"
import { authClient } from "../../lib"

const { KMS_ACCESS_KEY, NODE_ENV, KMS_BASE_URL } = process.env

const env = NODE_ENV as Environment
export class KmsAPI extends RESTDataSource {
  override baseURL = KMS_BASE_URL || "http://localhost:8000/"
  private idToken: string | undefined

  constructor(options: { idToken: string | undefined; cache: KeyValueCache }) {
    super(options) // this sends our server's `cache` through
    this.idToken = options.idToken
  }

  protected override async willSendRequest(
    req: WillSendRequestOptions
  ): Promise<void> {
    req.headers["x-access-key"] = KMS_ACCESS_KEY || ""

    // The token for use to authenticate between services in GCP
    if (env !== "development") {
      const token = await authClient.getIdToken()
      req.headers["authorization"] = token || ""
    }

    // The id token that to be sent from the UI for use to verify user.
    req.headers["id-token"] = this.idToken || ""
  }

  // async createCryptoKey(): Promise<{ keyName: string }> {
  //   return this.post('admin/key/create/master')
  // }

  /**
   * @dev The route to create blockchain wallet.
   */
  async createWallet(): Promise<NexusGenObjects["CreateWalletResult"] | null> {
    return this.post("wallet/create")
  }

  /**
   * @dev The route to get balance of a specific address.
   */
  async getBalance(address: string): Promise<{ balance: string }> {
    return this.get(`wallet/balance/${encodeURIComponent(address)}`)
  }

  // =========================== //
  // These below functions are for only admin role, and will be used in development only, in production admin will connect to the blockchain directly from the UI for more security.
  async setProfileForFollow(
    contractAddress: string
  ): Promise<{ status: string }> {
    return this.post("admin/set/profile-follow", { body: { contractAddress } })
  }

  async setProfileForPublish(
    contractAddress: string
  ): Promise<{ status: string }> {
    return this.post("admin/set/profile-publish", { body: { contractAddress } })
  }

  async setOwner(ownerAddress: string): Promise<{ status: string }> {
    return this.post("admin/set/owner", { body: { ownerAddress } })
  }

  async setProfileForLike(
    contractAddress: string
  ): Promise<{ status: string }> {
    return this.post("admin/set/profile-like", { body: { contractAddress } })
  }

  async setPublishForLike(
    contractAddress: string
  ): Promise<{ status: string }> {
    return this.post("admin/set/publish-like", { body: { contractAddress } })
  }

  async setLikeFee(fee: number): Promise<{ status: string }> {
    return this.post("admin/set/fee/like", { body: { fee } })
  }

  async setPlatformFee(fee: number): Promise<{ status: string }> {
    return this.post("admin/set/fee/platform", { body: { fee } })
  }

  async withdrawFunds(): Promise<{ status: string }> {
    return this.post("admin/withdraw")
  }

  async setProfileForComment(
    contractAddress: string
  ): Promise<{ status: string }> {
    return this.post("admin/set/profile-comment", { body: { contractAddress } })
  }

  async setPublishForComment(
    contractAddress: string
  ): Promise<{ status: string }> {
    return this.post("admin/set/publish-comment", { body: { contractAddress } })
  }

  // ======================= //

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
    return this.post(`profiles/role`, {
      body: { role },
    })
  }

  /**
   * @dev Create profile NFT.
   * @param input see CreateProfileInput type
   */
  async createProfile(
    input: NexusGenInputs["CreateProfileInput"]
  ): Promise<{ status: string }> {
    return this.post(`profiles/create`, { body: { ...input } })
  }

  /**
   * @dev Update profile image.
   * @param input see UpdateProfileImageInput type
   */
  async updateProfileImage(
    input: NexusGenInputs["UpdateProfileImageInput"]
  ): Promise<{ status: string }> {
    return this.post(`profiles/update`, { body: { ...input } })
  }

  /**
   * @dev Set a profile as default.
   * @param handle {string} - the handle to be set as default
   */
  async setDefaultProfile(handle: string): Promise<{ status: string }> {
    return this.post(`profiles/default`, {
      body: { handle },
    })
  }

  /**
   * @dev Call validate handle on the contract which will validate length and uniqueness.
   * @param handle {string}
   */
  async verifyHandle(handle: string): Promise<{ valid: boolean }> {
    return this.post("profiles/handle/verify", { body: { handle } })
  }

  /**
   * @dev Estimate gas for creating a profile nft.
   * @param input see CreateProfileInput type
   */
  async estimateGasCreateProfile(
    input: NexusGenInputs["CreateProfileInput"]
  ): Promise<{ gas: string }> {
    return this.post(`profiles/gas/create`, { body: { ...input } })
  }

  /**
   * @dev Get user's default profile.
   */
  async getDefaultProfile(): Promise<{
    token: NexusGenObjects["ProfileToken"]
  }> {
    return this.get(`profiles/default`)
  }

  /**
   * @dev Get profile's image uri.
   * @param tokenId {number}
   */
  async getProfileImage(tokenId: number): Promise<{ uri: string }> {
    return this.get(`profiles/token-uri/tokenId/${encodeURIComponent(tokenId)}`)
  }

  // ======================= //

  /// ***********************
  /// ***** Follow Contract *****
  /// ***********************

  /**
   * @dev The route to check if an address has specified role.
   * @param role {Role} - see Role enum
   */
  async hasRoleFollow(
    role: NexusGenEnums["Role"]
  ): Promise<{ hasRole: boolean }> {
    return this.post(`follows/role`, {
      body: { role },
    })
  }

  /**
   * @dev A function to follow a profile.
   * @param input see FollowInput
   */
  async follow(
    input: NexusGenInputs["FollowInput"]
  ): Promise<{ status: string }> {
    return this.post(`follows/following`, { body: { ...input } })
  }

  /**
   * @dev Estimate gas for follow operation.
   * @param input see FollowInput type
   */
  async estimateGasFollow(
    input: NexusGenInputs["FollowInput"]
  ): Promise<{ gas: string }> {
    return this.post(`follows/gas/following`, { body: { ...input } })
  }

  /**
   * @dev Get profile's followers and following.
   * @param profileId {number}
   */
  async getProfileFollows(
    profileId: number
  ): Promise<NexusGenObjects["GetFollowsResult"]> {
    return this.get(`follows/profileId/${encodeURIComponent(profileId)}`)
  }

  // ======================= //

  /// ***********************
  /// ***** Publish Contract *****
  /// ***********************

  /**
   * @dev The route to check if an address has specified role.
   * @param role {Role} - see Role enum
   */
  async hasRolePublish(
    role: NexusGenEnums["Role"]
  ): Promise<{ hasRole: boolean }> {
    return this.post(`publishes/role`, {
      body: { role },
    })
  }

  /**
   * @dev Create publish nft
   * @param input see CreatePublishInput type
   */
  async createPublish(
    input: NexusGenInputs["CreatePublishInput"]
  ): Promise<{ status: string }> {
    return this.post(`publishes/create`, { body: { ...input } })
  }

  /**
   * @dev Update publish nft
   * @param input see UpdatePublishInput type
   */
  async updatePublish(
    input: NexusGenInputs["UpdatePublishInput"]
  ): Promise<{ status: string }> {
    return this.post(`publishes/update`, { body: { ...input } })
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
    return this.post(`publishes/delete`, {
      body: {
        publishId,
        creatorId,
      },
    })
  }

  /**
   * @dev Estimate gas for creating a publish nft.
   * @param input see CreateProfileInput type
   */
  async estimateGasCreatePublish(
    input: NexusGenInputs["CreatePublishInput"]
  ): Promise<{ gas: string }> {
    return this.post(`publishes/gas/create`, { body: { ...input } })
  }

  /**
   * @dev Get one publish by provided token id
   */
  async getPublish(
    tokenId: number
  ): Promise<{ token: NexusGenObjects["PublishToken"] }> {
    return this.get(`publishes/publishId/${encodeURIComponent(tokenId)}`)
  }

  /**
   * @dev Get publish nft token uri.
   * @param tokenId {number}
   */
  async getPublishTokenURI(tokenId: number): Promise<{ uri: string }> {
    return this.get(
      `publishes/token-uri/tokenId/${encodeURIComponent(tokenId)}`
    )
  }

  /**
   * @dev Get the Profile contract address stored on the Publish contract.
   */
  async getProfileAddressFromPublish(): Promise<{ address: string }> {
    return this.get(`publishes/profile-contract`)
  }

  // ======================= //

  /// ***********************
  /// ***** Comment Contract *****
  /// ***********************

  /**
   * @dev The route to check if an address has specified role.
   * @param role {Role} - see Role enum
   */
  async hasRoleComment(
    role: NexusGenEnums["Role"]
  ): Promise<{ hasRole: boolean }> {
    return this.post(`comments/role`, {
      body: { role },
    })
  }

  /**
   * @dev Make a comment on a publish
   * @param input see CreateCommentOnPublishInput type
   */
  async commentOnPublish(
    input: NexusGenInputs["CreateCommentInput"]
  ): Promise<{ status: string }> {
    return this.post(`comments/publish`, { body: { ...input } })
  }

  /**
   * @dev Make a comment on a comment
   * @param input see CreateCommentOnCommentInput type
   */
  async commentOnComment(
    input: NexusGenInputs["CreateCommentInput"]
  ): Promise<{ status: string }> {
    return this.post(`comments/comment`, { body: { ...input } })
  }

  /**
   * @dev Update comment nft
   * @param input see UpdateCommentInput type
   */
  async updateComment(
    input: NexusGenInputs["UpdateCommentInput"]
  ): Promise<{ status: string }> {
    return this.post(`comments/update`, { body: { ...input } })
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
    return this.post(`comments/delete`, {
      body: {
        commentId,
        creatorId,
      },
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
    return this.post(`comments/like`, {
      body: {
        commentId,
        profileId,
      },
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
    return this.post(`comments/disLike`, {
      body: {
        commentId,
        profileId,
      },
    })
  }

  /**
   * @dev Get one comment by provided token id
   */
  async getComment(
    tokenId: number
  ): Promise<{ token: NexusGenObjects["CommentToken"] }> {
    return this.get(`comments/commentId/${encodeURIComponent(tokenId)}`)
  }

  /**
   * @dev Get the Profile contract address stored on the Comment contract.
   */
  async getProfileAddressFromComment(): Promise<{ address: string }> {
    return this.get(`comments/profile-contract`)
  }

  /**
   * @dev Get the Publish contract address stored on the Comment contract.
   */
  async getPublishAddressFromComment(): Promise<{ address: string }> {
    return this.get(`comments/publish-contract`)
  }

  // ======================= //

  /// ***********************
  /// ***** Like Contract *****
  /// ***********************

  /**
   * @dev The route to check if an address has specified role.
   * @param role {Role} - see Role enum
   */
  async hasRoleLike(
    role: NexusGenEnums["Role"]
  ): Promise<{ hasRole: boolean }> {
    return this.post(`likes/role`, {
      body: { role },
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
    return this.post(`likes/like`, {
      body: {
        publishId,
        profileId,
      },
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
    return this.post(`likes/disLike`, {
      body: {
        publishId,
        profileId,
      },
    })
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
    return this.post(`likes/gas/like`, {
      body: {
        publishId,
        profileId,
      },
    })
  }

  async getOwnerAddress(): Promise<{ address: string }> {
    return this.get("likes/platform-owner")
  }

  async getProfileAddressFromLike(): Promise<{ address: string }> {
    return this.get("likes/profile-contract")
  }

  async getPublishAddressFromLike(): Promise<{ address: string }> {
    return this.get("likes/publish-contract")
  }

  async getLikeFee(): Promise<{ fee: number }> {
    return this.get("likes/fee/like")
  }

  async getPlatformFee(): Promise<{ fee: number }> {
    return this.get("likes/fee/platform")
  }
}
