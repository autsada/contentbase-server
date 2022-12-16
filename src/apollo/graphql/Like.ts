import {
  enumType,
  objectType,
  inputObjectType,
  extendType,
  nonNull,
  nullable,
} from "nexus"
import {
  AuthenticationError,
  UserInputError,
  ForbiddenError,
} from "apollo-server-express"

const authErrMessage = "*** You must be logged in ***"
const badRequestErrMessage = "Bad Request"
const forbiddenErrMessage = "Forbidden"

export const FeeResult = objectType({
  name: "FeeResult",
  definition(t) {
    t.nonNull.float("fee")
  },
})

export const LikeQuery = extendType({
  type: "Query",
  definition(t) {
    /**
     * @dev Get owner address.
     */
    t.field("getOwnerAddress", {
      type: nonNull("AddressResult"),
      async resolve(_root, _args, { dataSources }) {
        try {
          // Call the api.
          return dataSources.kmsAPI.getOwnerAddress()
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * @dev Get profile contract address.
     */
    t.field("getProfileAddressFromLike", {
      type: nonNull("AddressResult"),
      async resolve(_root, _args, { dataSources }) {
        try {
          // Call the api.
          return dataSources.kmsAPI.getProfileAddressFromLike()
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * @dev Get publish contract address.
     */
    t.field("getPublishAddressFromLike", {
      type: nonNull("AddressResult"),
      async resolve(_root, _args, { dataSources }) {
        try {
          // Call the api.
          return dataSources.kmsAPI.getPublishAddressFromLike()
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * @dev Get like fee.
     */
    t.field("getLikeFee", {
      type: nonNull("FeeResult"),
      async resolve(_root, _args, { dataSources }) {
        try {
          // Call the api.
          return dataSources.kmsAPI.getLikeFee()
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * @dev Get platform fee.
     */
    t.field("getPlatformFee", {
      type: nonNull("FeeResult"),
      async resolve(_root, _args, { dataSources }) {
        try {
          // Call the api.
          return dataSources.kmsAPI.getPlatformFee()
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
      async resolve(_roote, { data }, { dataSources, idToken }) {
        try {
          // User must logged in.
          if (!idToken) throw new AuthenticationError(authErrMessage)

          // Validation.
          if (!data) throw new UserInputError(badRequestErrMessage)
          const { role } = data
          if (!role) throw new UserInputError(badRequestErrMessage)

          // Call the api.
          const { hasRole } = await dataSources.kmsAPI.hasRoleLike(role)
          return hasRole
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * @dev The process to like a publish
     */
    t.field("likePublish", {
      type: nonNull("WriteResult"),
      args: { publishId: nonNull("Int"), profileId: nonNull("Int") },
      async resolve(_root, { publishId, profileId }, { dataSources, idToken }) {
        try {
          // User must logged in.
          if (!idToken) throw new AuthenticationError(authErrMessage)

          // Validation.
          if (
            !publishId ||
            typeof publishId !== "number" ||
            !profileId ||
            typeof profileId !== "number"
          )
            throw new UserInputError(badRequestErrMessage)

          // Call the api.
          return dataSources.kmsAPI.likePublish(publishId, profileId)
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * @dev The process to dis-like a publish
     */
    t.field("disLikePublish", {
      type: nonNull("WriteResult"),
      args: { publishId: nonNull("Int"), profileId: nonNull("Int") },
      async resolve(_root, { publishId, profileId }, { dataSources, idToken }) {
        try {
          // User must logged in.
          if (!idToken) throw new AuthenticationError(authErrMessage)
          // Validation.
          if (
            !publishId ||
            typeof publishId !== "number" ||
            !profileId ||
            typeof profileId !== "number"
          )
            throw new UserInputError(badRequestErrMessage)

          // Call the api.
          return dataSources.kmsAPI.disLikePublish(publishId, profileId)
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * @dev Estimate gas used to like a publish.
     */
    t.field("estimateGasLikePublish", {
      type: nonNull("EstimateGasResult"),
      args: { publishId: nonNull("Int"), profileId: nonNull("Int") },
      async resolve(
        _roote,
        { publishId, profileId },
        { dataSources, idToken }
      ) {
        try {
          // User must logged in.
          if (!idToken) throw new AuthenticationError(authErrMessage)

          // Validation.
          if (
            !publishId ||
            typeof publishId !== "number" ||
            !profileId ||
            typeof profileId !== "number"
          )
            throw new UserInputError(badRequestErrMessage)

          // Call the api.
          const { gas } = await dataSources.kmsAPI.estimateGasLikePublish(
            publishId,
            profileId
          )
          return { gas }
        } catch (error) {
          throw error
        }
      },
    })
  },
})
