import { objectType, inputObjectType, extendType, nonNull } from "nexus"
import {
  AuthenticationError,
  UserInputError,
  ForbiddenError,
} from "apollo-server-express"

const authErrMessage = "*** You must be logged in ***"
const badRequestErrMessage = "Bad Request"
const forbiddenErrMessage = "Forbidden"

/**",
 * The object containing required data to create a like nft.
 * @param profileId {number} - a profile token id that performs like
 * @param publishId {number} - a publish token id
 */
export const CreateLikeInput = inputObjectType({
  name: "CreateLikeInput",
  definition(t) {
    t.nonNull.int("profileId")
    t.nonNull.int("publishId")
  },
})

/**
 * Returned type of like mutation.
 * @dev see LikeToken.
 */
export const CreateLikeResult = objectType({
  name: "CreateLikeResult",
  definition(t) {
    t.nonNull.string("owner")
    t.nonNull.int("tokenId")
    t.nonNull.int("profileId")
    t.nonNull.int("publishId")
  },
})

export const LikeQuery = extendType({
  type: "Query",
  definition(t) {
    t.field("getLikeFee", {
      type: nonNull("Int"),
      async resolve(_root, _args, { dataSources }) {
        try {
          const { fee } = await dataSources.kmsAPI.getLikeFee()

          return fee
        } catch (error) {
          throw error
        }
      },
    })

    t.field("getPlatformFee", {
      type: nonNull("Float"),
      async resolve(_root, _args, { dataSources }) {
        try {
          const { fee } = await dataSources.kmsAPI.getPlatformFee()

          return fee
        } catch (error) {
          throw error
        }
      },
    })
  },
})

export const LikeMutation = extendType({
  type: "Mutation",
  definition(t) {
    /**
     * @dev Check if an address has a specific role.
     */
    t.field("hasRoleLike", {
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

          const { hasRole } = await dataSources.kmsAPI.hasRoleLike(uid, role)

          return hasRole
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * @dev The process to like a publish (create like nft)
     * @param input see CreateLikeInput
     */
    t.field("like", {
      type: nonNull("CreateLikeResult"),
      args: { input: nonNull("CreateLikeInput") },
      async resolve(_root, { input }, { dataSources, user }) {
        try {
          // User must be already logged in
          if (!user) throw new AuthenticationError(authErrMessage)
          const uid = user.uid

          if (!uid) throw new ForbiddenError(forbiddenErrMessage)

          // Validate input.
          if (!input) throw new UserInputError(badRequestErrMessage)
          const { profileId, publishId } = input

          if (
            typeof profileId !== "number" ||
            !profileId ||
            typeof publishId !== "number" ||
            !publishId
          )
            throw new UserInputError(badRequestErrMessage)

          // Create a like nft
          const { token } = await dataSources.kmsAPI.createLikeNft(uid, {
            profileId,
            publishId,
          })

          if (!token) throw new Error("Create follow nft failed.")

          return token
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * @dev The process to unLike (delete like nft)
     */
    t.field("unLike", {
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

          const { status } = await dataSources.kmsAPI.burnLikeNft(uid, tokenId)

          return { status }
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * @dev Estimate gas used for creating a like nft.
     * @param input - refer to CreateLikeInput type
     */
    t.field("estimateCreateLikeGas", {
      type: nonNull("EstimateCreateNFTGasResult"),
      args: { input: nonNull("CreateLikeInput") },
      async resolve(_roote, { input }, { dataSources, user }) {
        try {
          // User must be already logged in
          if (!user) throw new AuthenticationError(authErrMessage)
          const uid = user?.uid

          if (!uid) throw new ForbiddenError(forbiddenErrMessage)

          // Validate input.
          if (!input) throw new UserInputError(badRequestErrMessage)
          const { profileId, publishId } = input

          if (
            typeof profileId !== "number" ||
            !profileId ||
            typeof publishId !== "number" ||
            !publishId
          )
            throw new UserInputError(badRequestErrMessage)

          // Create a profile
          const { gas } = await dataSources.kmsAPI.estimateCreateLikeGas(uid, {
            profileId,
            publishId,
          })

          return { gas }
        } catch (error) {
          throw error
        }
      },
    })
  },
})
