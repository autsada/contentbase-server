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

const authErrMessage = '*** You must be logged in ***'
const badRequestErrMessage = 'Bad Request'

export const Role = enumType({
  name: 'Role',
  members: ['DEFAULT_ADMIN_ROLE', 'ADMIN_ROLE', 'UPGRADER_ROLE'],
})

/**
 * A profile object
 * @param profileId {number} - the id of the profile
 * @param owner {string} - the blockchain address that owns the profile
 * @param handle {string} - the handle of the profile
 * @param imageURI {string} - the uri of the profile image
 * @param isDefault whether the profile is default profile of the user or not
 *
 */
export const Profile = objectType({
  name: 'Profile',
  definition(t) {
    t.nonNull.int('profileId')
    t.nonNull.string('owner')
    t.nonNull.string('handle')
    t.string('imageURI')
    t.nonNull.boolean('isDefault')
  },
})

/**
 * An object containing required data to create a profile.
 * @param handle {string} - a handle
 * @param imageURI {string} - a uri of the image to be used as a profile image
 * @param tokenURI {string} - a uri of the metadata file to be used as a token metadata
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
 * @param handle {string} - a handle
 * @param imageURI {string} - a uri of the image to be used as a profile image
 * @param tokenURI {string} - a uri of the metadata file to be used as a token metadata
 *
 */
export const UpdateProfileImageInput = inputObjectType({
  name: 'UpdateProfileImageInput',
  definition(t) {
    t.nonNull.int('profileId')
    t.nonNull.string('imageURI')
    t.nonNull.string('tokenURI')
  },
})

export const CreateProfileResult = objectType({
  name: 'CreateProfileResult',
  definition(t) {
    t.int('profileId')
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
     * @dev Get profiles of a specific address
     */
    t.field('getMyProfiles', {
      type: nonNull(list('Profile')),
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

    /**
     * @dev Get a profile by id
     */
    t.field('getMyProfile', {
      type: nonNull('Profile'),
      args: { profileId: nonNull('Int') },
      async resolve(_root, { profileId }, { dataSources, user }) {
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

          const { profile } = await dataSources.blockchainAPI.getProfile(
            profileId,
            key
          )

          console.log('profile -->', profile)

          return profile
        } catch (error) {
          console.log('error -->', error)
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
     * @param handle a handle of the user.
     * @param imageURI a uri of the image to be used as a profile image, can be empty
     * @param tokenURI  a uri of the metadata file to be used as a token metadata
     */
    t.field('createProfileNft', {
      type: nonNull('CreateProfileResult'),
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

          // Check if handle has correct length and unique
          const isHandleUnique = await dataSources.blockchainAPI.verifyHandle(
            handle
          )

          if (!isHandleUnique) throw new UserInputError('This handle is taken')

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
          const createProfileResult =
            await dataSources.blockchainAPI.createProfileNft({
              // key: wallet.key,
              key,
              data: {
                handle,
                imageURI: imageURI || '',
                tokenURI,
              },
            })

          if (!createProfileResult)
            throw new Error(
              'Error occured while attempting to create a profile nft.'
            )

          const { profileId, isDefault } = createProfileResult

          // // Update user's account in Firestore
          // const newProfile: NexusGenObjects['Profile'] = {
          //   profileId,
          //   owner: address,
          //   handle,
          //   imageURI: imageURI || '',
          //   isDefault,
          // }

          // await dataSources.firestoreAPI.updateAccount({
          //   docId: account.id,
          //   data: {
          //     profiles: !profiles ? [newProfile] : [...profiles, newProfile],
          //     // Set logged in profile
          //     loggedInProfile: !loggedInProfile ? profileId : loggedInProfile,
          //   },
          // })

          return { profileId }
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * @dev The process to update profile for users who signed in with traditional providers (phone | email | google).
     * @param profileId an id of the profile to be updated.
     * @param imageURI a uri of the image to be used as a new profile image
     * @param tokenURI  a uri of the metadata file to be used as a token metadata
     */
    t.field('updateProfileImage', {
      type: nonNull('CreateProfileResult'),
      args: { input: nonNull('UpdateProfileImageInput') },
      async resolve(_root, { input }, { dataSources, user }) {
        try {
          // User must be already logged in
          // if (!user) throw new AuthenticationError(authErrMessage)
          // const uid = user.uid

          // Check if handle and tokenURI are given
          if (!input) throw new UserInputError(badRequestErrMessage)

          const { profileId: tokenId, imageURI, tokenURI } = input

          if (!tokenId || !imageURI || !tokenURI)
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

          // Create a profile
          const updateProfileResult =
            await dataSources.blockchainAPI.updateProfileImage({
              // key: wallet.key,
              key,
              profileId: tokenId,
              data: {
                imageURI,
                tokenURI,
              },
            })

          if (!updateProfileResult)
            throw new Error(
              'Error occured while attempting to update profile image.'
            )

          const { profileId } = updateProfileResult

          // // Update user's account in Firestore
          // const updatedProfiles = profiles.map(profile => {
          //  if (profile.profileId !== tokenId) return profile
          //  return ({
          //    ...profile,
          //    imageURI
          // })
          // })

          // await dataSources.firestoreAPI.updateAccount({
          //   docId: account.id,
          //   data: {
          //     profiles: updatedProfiles
          //   },
          // })

          return { profileId }
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * @dev The process to set profile as default for users who signed in with traditional providers (phone | email | google).
     * @param profileId an id of the profile to be updated.
     */
    t.field('setDefaultProfile', {
      type: nonNull('CreateProfileResult'),
      args: { tokenId: nonNull('Int') },
      async resolve(_root, { tokenId }, { dataSources, user }) {
        try {
          // User must be already logged in
          // if (!user) throw new AuthenticationError(authErrMessage)
          // const uid = user.uid

          // Check if handle and tokenURI are given
          if (!tokenId) throw new UserInputError(badRequestErrMessage)

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
          const updateProfileResult =
            await dataSources.blockchainAPI.setProfileAsDefault({
              // key: wallet.key,
              key,
              profileId: tokenId,
            })

          if (!updateProfileResult)
            throw new Error(
              'Error occured while attempting to update profile image.'
            )

          const { profileId } = updateProfileResult

          // // Update user's account in Firestore
          // const updatedProfiles = profiles.map(profile => {
          //  if (profile.profileId !== tokenId) return ({...profile, isDefault: false})
          //  return ({
          //    ...profile,
          //    isDefault: true
          // })
          // })

          // await dataSources.firestoreAPI.updateAccount({
          //   docId: account.id,
          //   data: {
          //     profiles: updatedProfiles
          //   },
          // })

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
