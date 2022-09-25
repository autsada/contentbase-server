import {
  objectType,
  enumType,
  extendType,
  nonNull,
  stringArg,
  list,
  inputObjectType,
} from 'nexus'
import {
  AuthenticationError,
  UserInputError,
  ForbiddenError,
} from 'apollo-server-express'

import { NexusGenObjects } from '../typegen'

const authErrMessage = '*** You must be logged in ***'
const badRequestErrMessage = 'Bad Request'

export const Role = enumType({
  name: 'Role',
  members: ['DEFAULT_ADMIN_ROLE', 'ADMIN_ROLE', 'UPGRADER_ROLE'],
})

/**
 * @notice
 *
 * @dev "profileId" the id of the profile
 * @dev "owner" the blockchain address that owns the profile
 * @dev "uid" the id of the user doc in Firestore
 * @dev "handle" handle of the profile
 * @dev "imageURI1" ipfs uri of the profile image
 * @dev "imageURI2" cloud storage uri of the profile image
 * @dev "isDefault" whether the profile is default profile of the user or not
 */
export const Profile = objectType({
  name: 'Profile',
  definition(t) {
    t.nonNull.int('profileId')
    t.nonNull.string('owner')
    t.nonNull.string('uid')
    t.nonNull.string('handle')
    t.string('imageURI1')
    t.string('imageURI2')
    t.nonNull.boolean('isDefault')
  },
})

export const CreateProfileInput = inputObjectType({
  name: 'CreateProfileInput',
  definition(t) {
    t.nonNull.string('handle')
    t.string('imageURI1')
    t.string('imageURI2')
  },
})

export const CreateProfileResult = objectType({
  name: 'CreateProfileResult',
  definition(t) {
    t.int('profileId')
  },
})

export const HasRoleInput = inputObjectType({
  name: 'HasRoleInput',
  definition(t) {
    t.nonNull.field('role', { type: 'Role' })
  },
})

export const ProfileQuery = extendType({
  type: 'Query',
  definition(t) {
    /**
     * @dev If true the handle is unique and valid
     */
    t.field('isHandleUnique', {
      type: nonNull('Boolean'),
      args: { handle: nonNull(stringArg()) },
      async resolve(_root, { handle }, { dataSources }) {
        try {
          if (!handle) throw new UserInputError(badRequestErrMessage)

          const { isHandleUnique } =
            await dataSources.blockchainAPI.verifyHandle(handle)
          return isHandleUnique
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * @dev Get total profiles count of the contract
     */
    t.field('getProfilesCount', {
      type: nonNull('Int'),
      async resolve(_root, _args, { dataSources }) {
        try {
          const { profilesCount } =
            await dataSources.blockchainAPI.getTotalProfiles()

          return profilesCount
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * @dev Get profiles of a specific address
     */
    t.field('getMyProfiles', {
      type: nonNull(list('Profile')),
      async resolve(_root, _args, { dataSources, user }) {
        try {
          if (!user) throw new AuthenticationError(authErrMessage)
          const uid = user.uid

          // Get user's wallet
          const { wallet } = await dataSources.firestoreAPI.getWallet(uid)
          if (!wallet || !wallet.address || !wallet.key)
            throw new ForbiddenError('Forbidden')

          const { address, key } = wallet

          const { profiles } = await dataSources.blockchainAPI.getMyProfiles(
            address,
            key
          )

          return profiles
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
     * @dev Check if an address has a specific role
     */
    t.field('hasRole', {
      type: nonNull('Boolean'),
      args: { data: nonNull('HasRoleInput') },
      async resolve(_roote, { data }, { dataSources, user }) {
        try {
          if (!user) throw new AuthenticationError(authErrMessage)
          const uid = user.uid

          if (!data) throw new UserInputError(badRequestErrMessage)
          const { role } = data

          // Get user's wallet
          const { wallet } = await dataSources.firestoreAPI.getWallet(uid)
          if (!wallet) throw new ForbiddenError('Forbidden')

          const { address, key } = wallet
          if (!address || !key) throw new ForbiddenError('Forbidden')

          const { hasRole } = await dataSources.blockchainAPI.hasRole({
            key,
            address,
            role,
          })

          return hasRole
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * @dev The process to create profile nft for users who signed in with traditional providers (phone | email | google).
     * @params "handle" (required) a handle of the user.
     * @params "imageUrl" (optional) a profile image url.
     */
    t.field('createProfileNft', {
      type: nonNull('CreateProfileResult'),
      args: { input: nonNull('CreateProfileInput') },
      async resolve(_root, { input }, { dataSources, user }) {
        try {
          // User must be already logged in
          if (!user) throw new AuthenticationError(authErrMessage)
          const uid = user.uid

          // Check if handle is given
          if (!input) throw new UserInputError(badRequestErrMessage)

          const { handle, imageURI1, imageURI2 } = input

          if (!handle) throw new UserInputError(badRequestErrMessage)

          // Check if handle has correct length and unique
          const isHandleUnique = await dataSources.blockchainAPI.verifyHandle(
            handle
          )

          if (!isHandleUnique) throw new UserInputError('This handle is taken')

          // Get user's wallet from Firestore
          const { wallet } = await dataSources.firestoreAPI.getWallet(uid)

          // Throw error if user doesn't have wallet yet
          if (!wallet || !wallet.address || !wallet.key)
            throw new Error('No Wallet Found')

          // Get user's account from Firestore
          const { account } = await dataSources.firestoreAPI.getAccount(uid)
          if (!account) throw new Error('No Account Found')

          // Verify the address is correct
          if (wallet.address !== account.address)
            throw new ForbiddenError('Forbidden')

          const { address, loggedInProfile } = account

          // Get user's profiles from blockchain
          const { profiles } = await dataSources.blockchainAPI.getMyProfiles(
            address,
            wallet.key
          )
          const isDefault = !profiles || profiles.length === 0

          // Construct raw profile object
          const rawProfile = {
            uid,
            handle,
            imageURI1: imageURI1 || '',
            imageURI2: imageURI2 || '',
            isDefault,
          }
          const createProfileResult =
            await dataSources.blockchainAPI.createProfileNft({
              key: wallet.key,
              data: rawProfile,
            })

          if (!createProfileResult)
            throw new Error(
              'Error occured while attempting to create a profile nft.'
            )

          const profileId = createProfileResult.profileId

          // Update user's account in Firestore
          const newProfile: NexusGenObjects['Profile'] = {
            profileId,
            owner: address,
            ...rawProfile,
          }

          await dataSources.firestoreAPI.updateAccount({
            docId: account.id,
            data: {
              profiles: !profiles ? [newProfile] : [...profiles, newProfile],
              // Set logged in profile
              loggedInProfile: !loggedInProfile ? profileId : loggedInProfile,
            },
          })

          return { profileId }
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * @dev Estimate gas used for creating a profile
     */
    t.field('estimateCreateProfileGas', {
      type: nonNull('EstimateCreateProfileGasResult'),
      args: { input: nonNull('CreateProfileInput') },
      async resolve(_roote, { input }, { dataSources, user }) {
        try {
          // User must be already logged in
          if (!user) throw new AuthenticationError(authErrMessage)
          const uid = user?.uid

          // Check if handle is given
          if (!input) throw new UserInputError(badRequestErrMessage)

          const { handle, imageURI1, imageURI2 } = input

          if (!handle) throw new UserInputError(badRequestErrMessage)
          // Check if handle has correct length and unique
          const isHandleUnique = await dataSources.blockchainAPI.verifyHandle(
            handle
          )

          if (!isHandleUnique) throw new UserInputError('The handle is taken')

          // Get user's wallet from Firestore
          const { wallet } = await dataSources.firestoreAPI.getWallet(uid)

          // Throw error if user doesn't have wallet yet
          if (!wallet || !wallet.address || !wallet.key)
            throw new Error('No Wallet Found')

          const estimateGasResult =
            await dataSources.blockchainAPI.estimateCreateProfileGas({
              key: wallet.key,
              data: {
                uid,
                handle,
                imageURI1: imageURI1 || '',
                imageURI2: imageURI2 || '',
                isDefault: true, // Assume its's true
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
