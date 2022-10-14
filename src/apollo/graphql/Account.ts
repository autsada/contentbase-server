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

export const EstimateCreateProfileGasResult = objectType({
  name: "EstimateCreateProfileGasResult",
  definition(t) {
    t.nonNull.string("gas")
  },
})

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

          const { balance } = await dataSources.blockchainAPI.getBalance(
            address
          )

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

          // Check if user already has a wallet
          // We save wallet info in wallets collection and wallet's address in accounts collection, so if user has account and the account has "address" field we assume that user already as wallet (without having to query wallets collection)
          const { account } = await dataSources.firestoreAPI.getAccount(uid)

          // Create new wallet only for users that don't have it yet
          if (account && account.address)
            throw new Error("You already have a wallet")

          const walletResult = await dataSources.blockchainAPI.createWallet()

          if (!walletResult) throw new Error("Create wallet failed")
          const { address, key } = walletResult

          // Create a new doc in wallets collection
          await dataSources.firestoreAPI.createWallet(uid, {
            address: address.toLowerCase(),
            key,
          })

          // Save wallet to user's account
          await dataSources.firestoreAPI.createAccount(uid, {
            address: address.toLowerCase(),
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
