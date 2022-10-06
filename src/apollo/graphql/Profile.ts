import { extendType, nonNull, stringArg, list, inputObjectType } from 'nexus'
import {
  AuthenticationError,
  UserInputError,
  ForbiddenError,
} from 'apollo-server-express'

import { profilesCollection } from '../../lib'
import type { NexusGenObjects } from '../typegen'

const authErrMessage = '*** You must be logged in ***'
const badRequestErrMessage = 'Bad Request'

/**
 * An object containing required data to create a profile.
 * @param handle {string} - a handle
 * @param imageURI {string} - a uri of the image to be used as a profile image, can be empty
 * @param tokenURI {string} - a uri of the token's metadata
 *
 */
export const CreateProfileInput = inputObjectType({
  name: 'CreateProfileInput',
  definition(t) {
    t.nonNull.string('handle')
    t.string('imageURI')
    t.nonNull.string('tokenURI')
  },
})

/**
 * An object containing required data to update profile image
 * @param docId {string} - a document id of the profiles collection in Firestore
 * @param profileId {number} - a token id of the profile token
 * @param tokenURI {string} - a uri of the token's metadata
 * @param imageURI {string} - a uri of the image to be used as a profile image
 *
 */
export const UpdateProfileImageInput = inputObjectType({
  name: 'UpdateProfileImageInput',
  definition(t) {
    t.nonNull.string('docId')
    t.nonNull.int('profileId')
    t.nonNull.string('tokenURI')
    t.string('imageURI')
  },
})

export const ProfileQuery = extendType({
  type: 'Query',
  definition(t) {
    /**
     * @dev If true the handle is unique and valid
     * @param handle
     */
    t.field('isHandleUnique', {
      type: nonNull('Boolean'),
      args: { handle: nonNull(stringArg()) },
      async resolve(_root, { handle }, { dataSources }) {
        try {
          if (!handle) throw new UserInputError(badRequestErrMessage)

          // Has to lowercase the handle before sending to the blockchain
          const { isHandleUnique } =
            await dataSources.blockchainAPI.verifyHandle(handle.toLowerCase())
          return isHandleUnique
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * @dev Get profiles of a user
     */
    t.field('getMyProfiles', {
      type: nonNull(list('Token')),
      async resolve(_root, _args, { dataSources, user }) {
        try {
          // if (!user) throw new AuthenticationError(authErrMessage)
          // const uid = user.uid

          // // Get user's wallet
          // const { wallet } = await dataSources.firestoreAPI.getWallet(uid)
          // if (!wallet || !wallet.address || !wallet.key)
          //   throw new ForbiddenError('Forbidden')

          // const { address, key } = wallet
          const address = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
          const key =
            '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'

          // TODO: Get user's profile ids from Firestore
          const { tokens } = await dataSources.blockchainAPI.getMyProfiles(
            key,
            [1, 2, 3, 4, 5]
          )

          return tokens
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * @dev Get a profile by id
     * @param profileId - a token id
     */
    t.field('getProfile', {
      type: nonNull('Token'),
      args: { profileId: nonNull('Int') },
      async resolve(_root, { profileId }, { dataSources }) {
        try {
          const { token } = await dataSources.blockchainAPI.getProfile(
            profileId
          )

          return token
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * @dev Get user's default profile
     */
    t.field('getDefaultProfile', {
      type: nonNull('Token'),
      async resolve(_root, _args, { dataSources, user }) {
        try {
          // if (!user) throw new AuthenticationError(authErrMessage)
          // const uid = user.uid

          // // Get user's wallet
          // const { wallet } = await dataSources.firestoreAPI.getWallet(uid)
          // if (!wallet || !wallet.address || !wallet.key)
          //   throw new ForbiddenError('Forbidden')

          // const { key } = wallet
          const address = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
          const key =
            '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'

          const { token } = await dataSources.blockchainAPI.getDefaultProfile(
            key
          )

          return token
        } catch (error) {
          throw error
        }
      },
    })
  },
})

export const ProfileMutation = extendType({
  type: 'Mutation',
  definition(t) {
    /**
     * @dev The process to create profile nft for users who signed in with traditional providers (phone | email | google).
     * @param input - refer to CreateProfileInput type
     */
    t.field('createProfileNft', {
      type: nonNull('Token'),
      args: { input: nonNull('CreateProfileInput') },
      async resolve(_root, { input }, { dataSources, user }) {
        try {
          // User must be already logged in
          // if (!user) throw new AuthenticationError(authErrMessage)
          // const uid = user.uid

          // Check if handle and tokenURI are given
          if (!input) throw new UserInputError(badRequestErrMessage)

          const { handle, imageURI, tokenURI } = input

          if (!handle || !tokenURI)
            throw new UserInputError(badRequestErrMessage)

          // Make sure to lower case handle or will get error
          const formattedHandle = handle.toLowerCase()

          // Check if handle has correct length and unique
          const isHandleUnique = await dataSources.blockchainAPI.verifyHandle(
            formattedHandle
          )

          if (!isHandleUnique) throw new UserInputError('This handle is taken')

          // // Get user's wallet from Firestore
          // const { wallet } = await dataSources.firestoreAPI.getWallet(uid)

          // User must have both wallet and account before creating profile
          // // Throw error if user doesn't have wallet yet
          // if (!wallet || !wallet.address || !wallet.key)
          //   throw new Error('You do not have wallet')

          // // Get user's account from Firestore
          // const { account } = await dataSources.firestoreAPI.getAccount(uid)
          // if (!account) throw new Error('You do not have wallet')

          // // Verify the address is correct
          // if (wallet.address !== account.address)
          //   throw new ForbiddenError('Forbidden')

          // const { address, loggedInProfile, profiles } = account
          const address = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
          const key =
            '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'

          // Create a profile
          const { token } = await dataSources.blockchainAPI.createProfileNft({
            // key: wallet.key,
            key,
            data: {
              handle: formattedHandle,
              imageURI: imageURI || '',
              tokenURI,
            },
          })

          if (!token) throw new Error('Create profile nft failed.')

          // Save new token in Firestore (profiles collection), must include original handle (the handle before lowercase prefixed with "@") for displaying on the UI
          // await dataSources.firestoreAPI.createTokenDoc<
          //   NexusGenObjects['Token'] & { displayedHandle: string }
          // >({
          //   collectionName: profilesCollection,
          //   data: {
          //     ...token,
          //     displayedHandle: `@${handle}`,
          //   },
          // })

          return token
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * @dev The process to update profile for users who signed in with traditional providers (phone | email | google).
     * @param input - refer to UpdateProfileImageInput type
     */
    t.field('updateProfileImage', {
      type: nonNull('Token'),
      args: { input: nonNull('UpdateProfileImageInput') },
      async resolve(_root, { input }, { dataSources, user }) {
        try {
          // User must be already logged in
          // if (!user) throw new AuthenticationError(authErrMessage)
          // const uid = user.uid

          // Check if handle and tokenURI are given
          if (!input) throw new UserInputError(badRequestErrMessage)

          const { docId, profileId, imageURI, tokenURI } = input

          if (!docId || !profileId || !imageURI || !tokenURI)
            throw new UserInputError(badRequestErrMessage)

          // // Get user's wallet from Firestore
          // const { wallet } = await dataSources.firestoreAPI.getWallet(uid)

          // // Throw error if user doesn't have wallet yet
          // if (!wallet || !wallet.address || !wallet.key)
          //   throw new Error('No Wallet Found')

          // // Get user's account from Firestore
          // const { account } = await dataSources.firestoreAPI.getAccount(uid)
          // if (!account) throw new Error('No Account Found')

          // // Verify the address is correct
          // if (wallet.address !== account.address)
          //   throw new ForbiddenError('Forbidden')

          // const { address, loggedInProfile, profiles } = account
          const address = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
          const key =
            '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'

          // Update the profile
          const { token } = await dataSources.blockchainAPI.updateProfileImage({
            // key: wallet.key,
            key,
            profileId,
            data: {
              imageURI,
              tokenURI,
            },
          })

          if (!token) throw new Error('Update profile image failed.')

          // // Update the profile doc in Firestore
          // await dataSources.firestoreAPI.updateTokenDoc<
          //   NexusGenObjects['Token']
          // >({
          //   collectionName: profilesCollection,
          //   docId,
          //   data: token,
          // })

          return token
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * @dev The process to set profile as default for users who signed in with traditional providers (phone | email | google).
     * @param input - refer to SetDefaultProfileInput type
     */
    t.field('setDefaultProfile', {
      type: nonNull('Int'),
      args: { profileId: nonNull('Int') },
      async resolve(_root, { profileId }, { dataSources, user }) {
        try {
          // User must be already logged in
          // if (!user) throw new AuthenticationError(authErrMessage)
          // const uid = user.uid

          if (!profileId) throw new UserInputError('Bad request')

          // // Get user's wallet from Firestore
          // const { wallet } = await dataSources.firestoreAPI.getWallet(uid)

          // // Throw error if user doesn't have wallet yet
          // if (!wallet || !wallet.address || !wallet.key)
          //   throw new Error('No Wallet Found')

          // // Get user's account from Firestore
          // const { account } = await dataSources.firestoreAPI.getAccount(uid)
          // if (!account) throw new Error('No Account Found')

          // // Verify the address is correct
          // if (wallet.address !== account.address)
          //   throw new ForbiddenError('Forbidden')

          // const { address, loggedInProfile, profiles } = account
          const address = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
          const key =
            '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'

          // Create a profile
          const { token } = await dataSources.blockchainAPI.setDefaultProfile({
            // key: wallet.key,
            key,
            profileId,
          })

          if (!token)
            throw new Error(
              'Error occured while attempting to update profile image.'
            )

          return token.tokenId
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * @dev Estimate gas used for creating a profile
     * @param input - refer to CreateProfileInput type
     */
    t.field('estimateCreateProfileGas', {
      type: nonNull('EstimateCreateProfileGasResult'),
      args: { input: nonNull('CreateProfileInput') },
      async resolve(_roote, { input }, { dataSources, user }) {
        try {
          // // User must be already logged in
          // if (!user) throw new AuthenticationError(authErrMessage)
          // const uid = user?.uid

          // Check if handle is given
          if (!input) throw new UserInputError(badRequestErrMessage)

          const { handle, imageURI, tokenURI } = input

          if (!handle || !tokenURI)
            throw new UserInputError(badRequestErrMessage)

          // Check if handle has correct length and unique
          const isHandleUnique = await dataSources.blockchainAPI.verifyHandle(
            handle
          )

          if (!isHandleUnique) throw new UserInputError('The handle is taken')

          // // Get user's wallet from Firestore
          // const { wallet } = await dataSources.firestoreAPI.getWallet(uid)

          // // Throw error if user doesn't have wallet yet
          // if (!wallet || !wallet.address || !wallet.key)
          //   throw new Error('No Wallet Found')
          const address = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
          const key =
            '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'

          const estimateGasResult =
            await dataSources.blockchainAPI.estimateCreateProfileGas({
              // key: wallet.key,
              key,
              data: {
                handle,
                imageURI: imageURI || '',
                tokenURI,
              },
            })

          return { gas: estimateGasResult.gas }
        } catch (error) {
          throw error
        }
      },
    })
  },
})
