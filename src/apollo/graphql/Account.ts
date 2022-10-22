import { objectType, extendType, nonNull, list, enumType } from "nexus"
import { AuthenticationError, UserInputError } from "apollo-server-express"

const authErrMessage = "*** You must be logged in ***"
const badRequestErrMessage = "Bad Request"

export const AccountType = enumType({
  name: "AccountType",
  members: ["traditional", "wallet"],
})

/**
 * Account type.
 * @param id {string} - Firestore document id, use Firebase Auth uid as a document id so it will be easier to query and link to user and wallet.
 * @param address {string} - a blockchain address.
 * @param type {enum} an account type, if user signs in with phone,email,google set it to "traditional", if wallet set to it "wallet".
 * @param createdAt {string}
 * @param updatedAt {string}
 */
export const Account = objectType({
  name: "Account",
  definition(t) {
    t.nonNull.id("id")
    t.nonNull.string("address")
    t.nonNull.field("type", { type: "AccountType" })
    t.nonNull.string("createdAt")
    t.string("updatedAt")
  },
})

/**
 * Wallet type.
 * @param id {string} - Firestore document id, use Firebase Auth uid as a document id so it will be easier to query and link to user and account.
 * @param address {string} - a blockchain address.
 * @param key {string} - a blockchain private key.
 * @param createdAt {string}
 * @param updatedAt {string}
 */
export const Wallet = objectType({
  name: "Wallet",
  definition(t) {
    t.nonNull.id("id")
    t.nonNull.string("address")
    t.nonNull.string("key")
    t.nonNull.string("createdAt")
    t.string("updatedAt")
  },
})

/**
 * Webhook Address Activity type.
 * @param id {string} - Firestore document id.
 * @param event {enun} - an event category
 * @param fromAddress {string} - a blockchain address
 * @param toAddress {string} - a blockchain address
 * @param value {number} - the value if the activity
 * @param isAcknowledged {boolean} - whether the frontend acknowledged already or not, set to false by default
 */
export const AddressActivity = objectType({
  name: "AddressActivity",
  definition(t) {
    t.nonNull.id("id")
    t.nonNull.field("event", {
      type: "WebHookEventCategory",
    })
    t.nonNull.string("fromAddress")
    t.nonNull.string("toAddress")
    t.float("value")
    t.nonNull.boolean("isAcknowledged")
  },
})

export const GetAccountResult = objectType({
  name: "GetAccount",
  definition(t) {
    t.field("account", {
      type: "Account",
    })
  },
})

export const CreateWalletResult = objectType({
  name: "CreateWalletResult",
  definition(t) {
    t.nonNull.string("address")
  },
})

// ===== Types for webhook route ===== //
export const WebHookEventCategory = enumType({
  name: "WebHookEventCategory",
  members: ["token", "internal", "external"],
})

export const WebHookRawContract = objectType({
  name: "WebHookRawContract",
  definition(t) {
    t.string("rawValue")
    t.string("address")
    t.int("decimal")
  },
})

export const WebHookAddressActivity = objectType({
  name: "WebHookAddressActivity",
  definition(t) {
    t.nonNull.field("category", { type: "WebHookEventCategory" })
    t.nonNull.string("fromAddress")
    t.nonNull.string("toAddress")
    t.string("erc721TokenId")
    t.float("value")
    t.nonNull.string("asset")
    t.nonNull.field("rawContract", {
      type: nonNull("WebHookRawContract"),
    })
    t.nonNull.string("hash")
  },
})

export const WebHookEvent = objectType({
  name: "WebHookEvent",
  definition(t) {
    t.nonNull.string("network")
    t.nonNull.field("activity", {
      type: nonNull(list(nonNull("WebHookAddressActivity"))),
    })
  },
})

export const WebHookRequestBody = objectType({
  name: "WebHookRequestBody",
  definition(t) {
    t.nonNull.string("webhookId")
    t.nonNull.string("id")
    t.nonNull.string("createdAt")
    t.nonNull.string("type")
    t.nonNull.field("event", {
      type: nonNull("WebHookEvent"),
    })
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
      async resolve(_root, { address }, { dataSources, user }) {
        try {
          // if (!user) throw new AuthenticationError(authErrMessage)

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
      async resolve(_root, _args, { dataSources, user }) {
        try {
          if (!user) throw new AuthenticationError(authErrMessage)
          const uid = user.uid

          // If user doesn't already have an account, create one for them.
          const { account } = await dataSources.firestoreAPI.getAccount(uid)

          // If user already has an account and a wallet.
          if (account && account.address) {
            // If an account has an address field it means that this account already has a wallet.
            throw new Error("You already have a wallet")
          }

          // Call kms api to create a new wallet.
          const walletResult = await dataSources.kmsAPI.createWallet(uid)

          if (!walletResult) throw new Error("Create wallet failed")
          const { address } = walletResult

          // Create account doc.
          await dataSources.firestoreAPI.createAccount(uid, {
            address,
            type: "traditional",
          })

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
