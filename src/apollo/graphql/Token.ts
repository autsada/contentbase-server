import {
  objectType,
  extendType,
  nonNull,
  enumType,
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
 * Type of token
 */
export const TokenType = enumType({
  name: 'TokenType',
  members: ['Profile', 'Publish', 'Follow', 'Like'],
})

/**
 * Token's visibility
 * @dev UNSET - for Profile, Follow, Like tokens
 * @dev ON/OFF - for Publish tokens
 */
export const TokenVisibility = enumType({
  name: 'TokenVisibility',
  members: ['UNSET', 'ON', 'OFF'],
})

/**
 * A Token object
 * @param tokenId {number} - an id of the token
 * @param associatedId {number} - an id of the associated token of the token
 * @param owner {string} - a blockchain address that owns the token
 * @param tokenType {enum} - a type of the token
 * @param visibility {enum} - a token's visibility
 * @param handle {string} - a handle that owns the token
 * @param imageURI {string} - an image uri of the token, for Profile it's a profile image uri, for Publish it's a preview image uri, empty string for Follow and Like
 * @param contentURI {string} - a content uri of the token, it's a uri of the content for Publish and empty for other tokens
 *
 */
export const Token = objectType({
  name: 'Token',
  definition(t) {
    t.nonNull.int('tokenId')
    t.nonNull.int('associatedId')
    t.nonNull.string('owner')
    t.nonNull.field('tokenType', { type: 'TokenType' })
    t.nonNull.field('visibility', { type: 'TokenVisibility' })
    t.nonNull.string('handle')
    t.nonNull.string('imageURI')
    t.nonNull.string('contentURI')
  },
})

export const HasRoleInput = inputObjectType({
  name: 'HasRoleInput',
  definition(t) {
    t.nonNull.field('role', { type: 'Role' })
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
  name: 'MetadataCustomProps',
  definition(t) {
    t.nonNull.string('handle')
    t.nonNull.string('owner')
    t.nonNull.field('type', { type: 'UploadType' })
    t.string('contentURI')
    t.nonNull.string('storageURL')
    t.string('storagePath')
  },
})

export const UploadParams = objectType({
  name: 'UploadParams',
  definition(t) {
    t.nonNull.string('userId')
    t.nonNull.string('address')
    t.nonNull.string('handle')
    t.nonNull.field('uploadType', { type: 'UploadType' })
    t.nonNull.string('fileName')
    t.nonNull.string('mime')
  },
})

/**
 * Metadata of the file uploaded to ipfs
 */
export const UploadReturnType = objectType({
  name: 'UploadReturnType',
  definition(t) {
    t.nonNull.string('cid')
    t.nonNull.string('tokenURI')
    t.nonNull.string('storagePath')
    t.nonNull.string('storageURL')
  },
})

export const TokenQuery = extendType({
  type: 'Query',
  definition(t) {
    /**
     * @dev Get total NFTs count of the contract
     */
    t.field('getTokensCount', {
      type: nonNull('Int'),
      async resolve(_root, _args, { dataSources, user }) {
        try {
          const { tokensCount } =
            await dataSources.blockchainAPI.getTokensCount()

          return tokensCount
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * @dev Get tokenURI of a token
     */
    t.field('tokenURI', {
      type: nonNull('String'),
      args: { tokenId: nonNull('Int') },
      async resolve(_root, { tokenId }, { dataSources }) {
        try {
          const { tokenURI } = await dataSources.blockchainAPI.getTokenURI(
            tokenId
          )

          return tokenURI
        } catch (error) {
          throw error
        }
      },
    })
  },
})

export const TokenMutation = extendType({
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
          // if (!user) throw new AuthenticationError(authErrMessage)
          // const uid = user.uid

          if (!data) throw new UserInputError(badRequestErrMessage)
          const { role } = data

          // // Get user's wallet
          // const { wallet } = await dataSources.firestoreAPI.getWallet(uid)
          // if (!wallet) throw new ForbiddenError('Forbidden')

          // const { address, key } = wallet
          // if (!address || !key) throw new ForbiddenError('Forbidden')
          const address = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
          const key =
            '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'

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
     * A function to burn token
     * @param tokenId {number} - a token id to be burned
     */
    t.field('burnToken', {
      type: nonNull('String'),
      args: { tokenId: nonNull('Int') },
      async resolve(_roote, { tokenId }, { dataSources, user }) {
        try {
          // if (!user) throw new AuthenticationError(authErrMessage)
          // const uid = user.uid

          if (!tokenId) throw new UserInputError(badRequestErrMessage)

          // // Get user's wallet
          // const { wallet } = await dataSources.firestoreAPI.getWallet(uid)
          // if (!wallet) throw new ForbiddenError('Forbidden')

          // const { address, key } = wallet
          // if (!address || !key) throw new ForbiddenError('Forbidden')
          const address = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
          const key =
            '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'

          const { status } = await dataSources.blockchainAPI.burnToken({
            tokenId,
            key,
          })

          return status
        } catch (error) {
          throw error
        }
      },
    })
  },
})
