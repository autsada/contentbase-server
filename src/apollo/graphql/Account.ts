import { objectType, extendType, nonNull, list, enumType } from 'nexus'
import { AuthenticationError, UserInputError } from 'apollo-server-express'

const authErrMessage = '*** You must be logged in ***'
const badRequestErrMessage = 'Bad Request'

export const AccountType = enumType({
  name: 'AccountType',
  members: ['traditional', 'wallet'],
})

/**
 * @notice
 *
 * @dev "profiles" is an array of profile NFTs created on the blockchain
 * @dev "walletId" is an encrypted private key of the blockchain address
 * @dev "address" is a blockchain address
 * @dev "authUid" the uid of the Firsbase Auth user who owns the account
 * @dev "loggedInProfile" the user's profile id that is currently used to log in
 * @dev "testnet" set to true if the app runs on testnet blockchain
 * @dev "type" if user signs in with phone,email,google set to "traditional", if wallet set to "wallet"
 */
export const Account = objectType({
  name: 'Account',
  definition(t) {
    t.nonNull.id('id')
    t.nonNull.field('profiles', {
      type: nonNull(list(nonNull('Profile'))),
    })
    t.nonNull.string('address')
    t.nonNull.int('loggedInProfile')
    t.nonNull.boolean('testnet')
    t.nonNull.string('authUid')
    t.nonNull.field('type', { type: 'AccountType' })
  },
})

/**
 * @dev "address" a blockchain address
 * @dev "key" an encrypted key
 */
export const Wallet = objectType({
  name: 'Wallet',
  definition(t) {
    t.nonNull.id('id')
    t.nonNull.string('address')
    t.nonNull.string('key')
  },
})

/**
 * @dev "event" - enum:an event category
 * @dev "fromAddress" - string:a blockchain address
 * @dev "toAddress" - string:a blockchain address
 * @dev "value" - number:the value if the activity
 * @dev "isAcknowledged" - boolean:whether the frontend acknowledged already or not, set to false by default
 */
export const AddressActivity = objectType({
  name: 'AddressActivity',
  definition(t) {
    t.nonNull.id('id')
    t.nonNull.field('event', {
      type: 'WebHookEventCategory',
    })
    t.nonNull.string('fromAddress')
    t.nonNull.string('toAddress')
    t.float('value')
    t.nonNull.boolean('isAcknowledged')
  },
})

export const GetAccountResult = objectType({
  name: 'GetAccount',
  definition(t) {
    t.field('account', {
      type: 'Account',
    })
  },
})

export const CreateWalletResult = objectType({
  name: 'CreateWalletResult',
  definition(t) {
    t.nonNull.string('address')
  },
})

export const EstimateCreateProfileGasResult = objectType({
  name: 'EstimateCreateProfileGasResult',
  definition(t) {
    t.nonNull.string('gas')
  },
})

export const WebHookEventCategory = enumType({
  name: 'WebHookEventCategory',
  members: ['token', 'internal', 'external'],
})

export const WebHookRawContract = objectType({
  name: 'WebHookRawContract',
  definition(t) {
    t.string('rawValue')
    t.string('address')
    t.int('decimal')
  },
})

export const WebHookAddressActivity = objectType({
  name: 'WebHookAddressActivity',
  definition(t) {
    t.nonNull.field('category', { type: 'WebHookEventCategory' })
    t.nonNull.string('fromAddress')
    t.nonNull.string('toAddress')
    t.string('erc721TokenId')
    t.float('value')
    t.nonNull.string('asset')
    t.nonNull.field('rawContract', {
      type: nonNull('WebHookRawContract'),
    })
    t.nonNull.string('hash')
  },
})

export const WebHookEvent = objectType({
  name: 'WebHookEvent',
  definition(t) {
    t.nonNull.string('network')
    t.nonNull.field('activity', {
      type: nonNull(list(nonNull('WebHookAddressActivity'))),
    })
  },
})

export const WebHookRequestBody = objectType({
  name: 'WebHookRequestBody',
  definition(t) {
    t.nonNull.string('webhookId')
    t.nonNull.string('id')
    t.nonNull.string('createdAt')
    t.nonNull.string('type')
    t.nonNull.field('event', {
      type: nonNull('WebHookEvent'),
    })
  },
})

/**
 * Type of  the file uploaded to ipfs
 */
export const UploadType = enumType({
  name: 'UploadType',
  members: ['avatar', 'post'],
})

/**
 * Metadata of the file uploaded to ipfs
 */
export const Metadata = objectType({
  name: 'Metadata',
  definition(t) {
    t.nonNull.string('handle')
    t.nonNull.string('fileName')
    t.nonNull.field('type', { type: 'UploadType' })
  },
})

export const UploadParams = objectType({
  name: 'UploadParams',
  definition(t) {
    t.nonNull.string('userId')
    t.nonNull.string('handle')
    t.nonNull.field('uploadType', { type: 'UploadType' })
    t.nonNull.string('fileName')
  },
})

/**
 * Metadata of the file uploaded to ipfs
 */
export const UploadReturnType = objectType({
  name: 'UploadReturnType',
  definition(t) {
    t.nonNull.string('metadataGateWayURL')
    t.nonNull.string('metadataURI')
    t.nonNull.string('imageGateWayURL')
    t.nonNull.string('imageURI')
    t.nonNull.string('storagePath')
    t.nonNull.string('storageURL')
  },
})

export const AccountQuery = extendType({
  type: 'Query',
  definition(t) {
    /**
     * @dev Get balance of a specific user
     */
    t.field('getMyBalance', {
      type: nonNull('String'),
      args: { address: nonNull('String') },
      async resolve(_root, { address }, { dataSources, user }) {
        try {
          // if (!user) throw new AuthenticationError(authErrMessage)

          if (!address) throw new UserInputError(badRequestErrMessage)

          const { balance } = await dataSources.blockchainAPI.getMyBalance(
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
  type: 'Mutation',

  definition(t) {
    /**
     * @dev Create Ethereum account for users sign in with traditional providers (phone | email | google).
     */
    t.field('createWallet', {
      type: nonNull('CreateWalletResult'),
      async resolve(_root, _args, { dataSources, user }) {
        try {
          if (!user) throw new AuthenticationError(authErrMessage)
          const uid = user.uid

          // Check if user already has a wallet
          // We save wallet info in wallets collection and wallet's address in accounts collection, so if user has account and the account has "address" field we assume that user already as wallet (without having to query wallets collection)
          const { account } = await dataSources.firestoreAPI.getAccount(uid)

          // Create new wallet only for users that don't have it yet
          if (account && account.address)
            throw new Error('You already have a wallet')

          const walletResult = await dataSources.blockchainAPI.createWallet()

          if (!walletResult) throw new Error('Create wallet failed')
          const { address, key } = walletResult

          // Create a new doc in wallets collection
          await dataSources.firestoreAPI.createWallet(uid, {
            address: address.toLowerCase(),
            key,
          })

          // Save wallet to user's account
          await dataSources.firestoreAPI.createAccount(uid, {
            address: address.toLowerCase(),
            profiles: [], // Important to set profiles field to an empty array at the first time account is created
            type: 'traditional',
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
