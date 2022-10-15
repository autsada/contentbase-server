import {
  enumType,
  objectType,
  inputObjectType,
  extendType,
  nonNull,
  list,
} from "nexus"
import {
  AuthenticationError,
  UserInputError,
  ForbiddenError,
} from "apollo-server-express"

import { publishesCollection } from "../../lib"
import type { NexusGenEnums, NexusGenObjects } from "../typegen"

const authErrMessage = "*** You must be logged in ***"
const badRequestErrMessage = "Bad Request"

/**
 * An object containing required data to create a publish.
 * @param tokenURI {string} - a uri of the token's metadata
 * @param profileId {number} - a token id of the creator's profile
 * @param imageURI {string} - a publish's thumbnail image uri
 * @param contentURI {string} - a publish's content uri
 *
 */
export const CreatePublishInput = inputObjectType({
  name: "CreatePublishInput",
  definition(t) {
    t.nonNull.string("tokenURI")
    t.nonNull.int("profileId")
    t.nonNull.string("imageURI")
    t.nonNull.string("contentURI")
  },
})

/**
 * An object containing required data to update a publish.
 * @param docId {string} - a publish document id in Firestore
 * @param publishId {number} - a token id of the publish to be updated
 * @param tokenURI {string} - a uri of the token's metadata
 * @param imageURI {string} - a publish's thumbnail image uri
 * @param contentURI {string} - a publish's content uri
 *
 */
export const UpdatePublishInput = inputObjectType({
  name: "UpdatePublishInput",
  definition(t) {
    t.nonNull.string("docId")
    t.nonNull.int("publishId")
    t.nonNull.string("tokenURI")
    t.string("imageURI")
    t.string("contentURI")
  },
})

export const PublishToken = objectType({
  name: "PublishToken",
  definition(t) {
    t.nonNull.int("tokenId")
    t.nonNull.int("creatorId")
    t.nonNull.string("owner")
    t.nonNull.string("imageURI")
    t.nonNull.string("contentURI")
    t.nonNull.int("likes")
  },
})

export const PublishQuery = extendType({
  type: "Query",
  definition(t) {
    /**
     * @dev Get publishes of a user
     */
    t.field("getMyPublishes", {
      type: nonNull(list("PublishToken")),
      async resolve(_root, _args, { dataSources, user }) {
        try {
          // if (!user) throw new AuthenticationError(authErrMessage)
          // const uid = user.uid

          // // Get user's wallet
          // const { wallet } = await dataSources.firestoreAPI.getWallet(uid)
          // if (!wallet || !wallet.address || !wallet.key)
          //   throw new ForbiddenError('Forbidden')

          // const { address, key } = wallet
          const address = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
          const key =
            "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"

          // TODO: Get user's profile ids from Firestore
          const { tokens } = await dataSources.kmsAPI.getMyPublishes(
            key,
            [1, 2, 3, 4, 5, 6, 7]
          )

          return tokens
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * @dev Get publishes
     */
    t.field("getPublishes", {
      type: nonNull(list("PublishToken")),
      async resolve(_root, _args, { dataSources, user }) {
        try {
          // if (!user) throw new AuthenticationError(authErrMessage)
          // const uid = user.uid

          // // Get user's wallet
          // const { wallet } = await dataSources.firestoreAPI.getWallet(uid)
          // if (!wallet || !wallet.address || !wallet.key)
          //   throw new ForbiddenError('Forbidden')

          // const { address, key } = wallet
          const address = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
          const key =
            "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"

          // TODO: Get user's profile ids from Firestore
          const { tokens } = await dataSources.kmsAPI.getPublishes([
            1, 2, 3, 4, 5, 6, 7,
          ])

          return tokens
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * @dev Get one publish
     */
    t.field("getPublish", {
      type: nonNull("PublishToken"),
      args: { publishId: nonNull("Int") },
      async resolve(_root, { publishId }, { dataSources }) {
        try {
          const { token } = await dataSources.kmsAPI.getPublish(publishId)

          return token
        } catch (error) {
          throw error
        }
      },
    })
  },
})

export const PublishMutation = extendType({
  type: "Mutation",
  definition(t) {
    /**
     * @dev The process to create publish nft
     * @param input - refer to CreatePublishInput
     * @dev if visibility is "UNSET" it will be converted to "ON" as "UNSET" is not allowed for Publish token
     */
    t.field("createPublishNft", {
      type: nonNull("PublishToken"),
      args: { input: nonNull("CreatePublishInput") },
      async resolve(_root, { input }, { dataSources, user }) {
        try {
          // User must be already logged in
          // if (!user) throw new AuthenticationError(authErrMessage)
          // const uid = user.uid

          // Validate input
          if (!input) throw new UserInputError(badRequestErrMessage)

          const { tokenURI, profileId, imageURI, contentURI } = input

          if (!tokenURI || !profileId || !imageURI || !contentURI)
            throw new UserInputError(badRequestErrMessage)

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
          const address = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
          const key =
            "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"

          // Create a profile
          const { token } = await dataSources.kmsAPI.createPublishNft({
            // key: wallet.key,
            key,
            data: {
              tokenURI,
              profileId,
              imageURI,
              contentURI,
            },
          })

          if (!token) throw new Error("Create profile nft failed.")

          // Save new token in Firestore (publishes collection)
          // await dataSources.firestoreAPI.createTokenDoc<
          //   NexusGenObjects['Token']
          // >({
          //   collectionName: publishesCollection,
          //   data: token,
          // })

          return token
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * @dev The process to update publish nft
     * @param input - refer to CreatePublishInput
     * @dev if visibility is "UNSET" it will be converted to "ON" as "UNSET" is not allowed for Publish token
     */
    t.field("updatePublishNft", {
      type: nonNull("PublishToken"),
      args: { input: nonNull("UpdatePublishInput") },
      async resolve(_root, { input }, { dataSources, user }) {
        try {
          // User must be already logged in
          // if (!user) throw new AuthenticationError(authErrMessage)
          // const uid = user.uid

          // Validate input
          if (!input) throw new UserInputError(badRequestErrMessage)

          const { docId, publishId, tokenURI, imageURI, contentURI } = input

          if (!docId || !publishId || !tokenURI)
            throw new UserInputError(badRequestErrMessage)

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
          const address = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
          const key =
            "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"

          // Create a profile
          const { token } = await dataSources.kmsAPI.updatePublishNft({
            // key: wallet.key,
            key,
            publishId,
            data: {
              tokenURI,
              imageURI,
              contentURI,
            },
          })

          if (!token) throw new Error("Create profile nft failed.")

          // // Save updated token in Firestore (publishes collection)
          // await dataSources.firestoreAPI.updateTokenDoc<
          //   NexusGenObjects['Token']
          // >({
          //   collectionName: publishesCollection,
          //   docId,
          //   data: token,
          // })

          return token
        } catch (error) {
          console.log("error -->", error)
          throw error
        }
      },
    })
  },
})
