import { objectType, inputObjectType, extendType, nonNull, list } from "nexus"
import {
  AuthenticationError,
  UserInputError,
  ForbiddenError,
} from "apollo-server-express"

const authErrMessage = "*** You must be logged in ***"
const badRequestErrMessage = "Bad Request"
const forbiddenErrMessage = "Forbidden"

/**",
 * The object containing required data to create a follow nft.
 * @param followerId {number} - a profile token id of the follower
 * @param followeeId {number} - a profile token id of the followee
 */
export const CreateFollowInput = inputObjectType({
  name: "CreateFollowInput",
  definition(t) {
    t.nonNull.int("followerId")
    t.nonNull.int("followeeId")
  },
})

/**
 * Returned type of CreateFollowNft mutation.
 * @dev see FollowToken.
 */
export const CreateFollowResult = objectType({
  name: "CreateFollowResult",
  definition(t) {
    t.nonNull.int("tokenId")
    t.nonNull.string("owner")
    t.nonNull.int("followerId")
    t.nonNull.int("followeeId")
  },
})

export const FollowQuery = extendType({
  type: "Query",
  definition(t) {
    t.field("fetchFollowers", {
      type: nonNull(list("CreateFollowResult")),
      async resolve(_root, _args, { dataSources, user }) {
        try {
          const { tokens } = await dataSources.kmsAPI.fetchFollowers([
            1, 2, 3, 4, 5, 6, 7,
          ])

          return tokens
        } catch (error) {
          throw error
        }
      },
    })
  },
})

export const FollowMutation = extendType({
  type: "Mutation",
  definition(t) {
    /**
     * @dev Check if an address has a specific role.
     */
    t.field("hasRoleFollow", {
      type: nonNull("Boolean"),
      args: { data: nonNull("HasRoleInput") },
      async resolve(_roote, { data }, { dataSources, user }) {
        try {
          if (!user) throw new AuthenticationError(authErrMessage)
          const uid = user.uid

          if (!uid) throw new ForbiddenError(forbiddenErrMessage)

          if (!data) throw new UserInputError(badRequestErrMessage)
          const { role } = data

          if (!role) throw new UserInputError(badRequestErrMessage)

          const { hasRole } = await dataSources.kmsAPI.hasRoleFollow(uid, role)

          return hasRole
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * @dev The process to follow other profile (create follow nft)
     * @param input see CreateFollowInput
     */
    t.field("follow", {
      type: nonNull("CreateFollowResult"),
      args: { input: nonNull("CreateFollowInput") },
      async resolve(_root, { input }, { dataSources, user }) {
        try {
          // User must be already logged in
          if (!user) throw new AuthenticationError(authErrMessage)
          const uid = user.uid

          if (!uid) throw new ForbiddenError(forbiddenErrMessage)

          // Validate input.
          if (!input) throw new UserInputError(badRequestErrMessage)
          const { followerId, followeeId } = input

          if (
            typeof followerId !== "number" ||
            !followerId ||
            typeof followeeId !== "number" ||
            !followeeId
          )
            throw new UserInputError(badRequestErrMessage)

          // Create a follow nft
          const { token } = await dataSources.kmsAPI.createFollowNft(uid, {
            followerId,
            followeeId,
          })

          if (!token) throw new Error("Create follow nft failed.")

          return token
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * @dev The process to unfollow (delete follow nft)
     */
    t.field("unFollow", {
      type: nonNull("BurnNFTResult"),
      args: { tokenId: nonNull("Int") },
      async resolve(_root, { tokenId }, { dataSources, user }) {
        try {
          // User must be already logged in
          if (!user) throw new AuthenticationError(authErrMessage)
          const uid = user.uid

          if (!uid) throw new ForbiddenError(forbiddenErrMessage)

          // Validate input
          if (typeof tokenId !== "number" || !tokenId)
            throw new UserInputError(badRequestErrMessage)

          const { status } = await dataSources.kmsAPI.burnFollowNft(
            uid,
            tokenId
          )

          return { status }
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * @dev Estimate gas used for creating a follow nft.
     * @param input - refer to CreatePublishInput type
     */
    t.field("estimateCreateFollowGas", {
      type: nonNull("EstimateCreateNFTGasResult"),
      args: { input: nonNull("CreateFollowInput") },
      async resolve(_roote, { input }, { dataSources, user }) {
        try {
          // User must be already logged in
          if (!user) throw new AuthenticationError(authErrMessage)
          const uid = user?.uid

          if (!uid) throw new ForbiddenError(forbiddenErrMessage)

          // Validate input.
          if (!input) throw new UserInputError(badRequestErrMessage)
          const { followerId, followeeId } = input

          if (
            typeof followerId !== "number" ||
            !followerId ||
            typeof followeeId !== "number" ||
            !followeeId
          )
            throw new UserInputError(badRequestErrMessage)

          // Create a profile
          const { gas } = await dataSources.kmsAPI.estimateCreateFollowGas(
            uid,
            {
              followerId,
              followeeId,
            }
          )

          return { gas }
        } catch (error) {
          throw error
        }
      },
    })
  },
})
