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

          if (!account) {
            // Create a new account.
            await dataSources.firestoreAPI.createAccount(uid, {
              type: "traditional",
            })
          }

          // Check if user already has a wallet, wallet id is the auth uid.
          const { wallet } = await dataSources.firestoreAPI.getWallet(uid)

          if (wallet) {
            // User already has a wallet, throw an error to let them know.
            // Before throwing, just need to make sure the account document as an "address" field.
            const { account: newFetchedAccount } =
              await dataSources.firestoreAPI.getAccount(uid)
            if (newFetchedAccount && !newFetchedAccount.address) {
              // This case should not exists, but we have to make sure that if it happens to exist, we have a logic to handle it.
              await dataSources.firestoreAPI.updateAccount({
                docId: uid,
                data: { address: wallet.address },
              })
            }

            throw new Error("You already have a wallet")
          }

          // Create a new wallet.
          // Kms server will create a wallet doc from there, so we don't have to do it here.
          const walletResult = await dataSources.kmsAPI.createWallet()

          if (!walletResult) throw new Error("Create wallet failed")
          const { address } = walletResult

          // Update account doc.
          await dataSources.firestoreAPI.updateAccount({
            docId: uid,
            data: { address },
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
