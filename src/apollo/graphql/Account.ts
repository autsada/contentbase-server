import { objectType, extendType, nonNull, list, enumType } from "nexus"
import { AuthenticationError, UserInputError } from "apollo-server-express"

const authErrMessage = "*** You must be logged in ***"
const badRequestErrMessage = "Bad Request"

export const CreateWalletResult = objectType({
  name: "CreateWalletResult",
  definition(t) {
    t.nonNull.string("address")
  },
})

// ================= //

// ===== Types for ipfs upload route ===== //
/**
 * Type of  the file uploaded to ipfs
 */
export const UploadType = enumType({
  name: "UploadType",
  members: ["avatar", "post"],
})

/**
 * An additional properties in NFT Metadata
 * @dev this type must be unioned with {image: File | Blob | Buffer}
 * @param handle {string}
 * @param owner {string} - A block chain address
 * @param type {UploadType} - "avatar" | "post"
 * @param contentURI {string} - A ipfs uri to the content of an NFT, this field will be empty for "avatar" upload type, and non-empty for "post" upload type
 * @param storageURL {string} - A cloud storage url to the content of an NFT
 * @param storagePath {string} - A path to cloud storage
 */
export const MetadataCustomProps = objectType({
  name: "MetadataCustomProps",
  definition(t) {
    t.nonNull.string("handle")
    t.nonNull.string("owner")
    t.nonNull.field("type", { type: "UploadType" })
    t.string("contentURI")
    t.nonNull.string("storageURL")
    t.string("storagePath")
  },
})

export const UploadParams = objectType({
  name: "UploadParams",
  definition(t) {
    t.nonNull.string("userId")
    t.nonNull.string("address")
    t.nonNull.string("handle")
    t.nonNull.field("uploadType", { type: "UploadType" })
    t.nonNull.string("fileName")
    t.nonNull.string("mime")
  },
})

/**
 * Metadata of the file uploaded to ipfs
 */
export const UploadReturnType = objectType({
  name: "UploadReturnType",
  definition(t) {
    t.nonNull.string("cid")
    t.nonNull.string("tokenURI")
    t.nonNull.string("storagePath")
    t.nonNull.string("storageURL")
  },
})

// ============ //

export const AccountQuery = extendType({
  type: "Query",
  definition(t) {
    /**
     * @dev Get balance of a specific user
     */
    t.field("getMyBalance", {
      type: nonNull("String"),
      args: { address: nonNull("String") },
      async resolve(_root, { address }, { dataSources }) {
        try {
          if (!address) throw new UserInputError(badRequestErrMessage)

          const { balance } = await dataSources.kmsAPI.getBalance(address)

          return balance
        } catch (error) {
          throw error
        }
      },
    })
  },
})

export const AccountMutation = extendType({
  type: "Mutation",

  definition(t) {
    /**
     * @dev Create Ethereum account for users sign in with traditional providers (phone | email | google).
     */
    t.field("createWallet", {
      type: nonNull("CreateWalletResult"),
      async resolve(_root, _args, { dataSources, idToken }) {
        try {
          if (!idToken) throw new AuthenticationError(authErrMessage)

          // Call kms api to create a new wallet.
          const walletResult = await dataSources.kmsAPI.createWallet()

          if (!walletResult) throw new Error("Create wallet failed")
          const { address } = walletResult

          // Add the address to Alchemy notify list
          await dataSources.webhooksApi.addAddress(address)

          return { address }
        } catch (error) {
          throw error
        }
      },
    })
  },
})
