import {
  extendType,
  nonNull,
  inputObjectType,
  objectType,
  nullable,
} from "nexus"

import { authErrMessage, badInputErrMessage, throwError } from "./Error"

/**
 * The object containing required data for follow function.
 * @param profileId {number} - a token id of the profile token
 * @param imageURI {string} - a uri of the image to be used as a profile image
 *
 */
export const FollowInput = inputObjectType({
  name: "FollowInput",
  definition(t) {
    t.nonNull.int("followerId")
    t.nonNull.int("followeeId")
  },
})

/**
 * The return object type for fetching a profile's followers and following .
 */
export const GetFollowsResult = objectType({
  name: "GetFollowsResult",
  definition(t) {
    t.nonNull.int("followers")
    t.nonNull.int("following")
  },
})

export const FollowQuery = extendType({
  type: "Query",
  definition(t) {
    /**
     * @dev Get user's default profile
     */
    t.field("getFollows", {
      type: nullable("GetFollowsResult"),
      args: { profileId: nonNull("Int") },
      async resolve(_root, { profileId }, { dataSources, idToken }) {
        try {
          // User must logged in.
          if (!idToken) throwError(authErrMessage, "UNAUTHENTICATED")

          // Call the api.
          const result = await dataSources.kmsAPI.getProfileFollows(profileId)

          return result
        } catch (error) {
          // Return null if no profile found or error occurred so the process can continue.
          return null
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
      async resolve(_roote, { data }, { dataSources }) {
        try {
          // Validation.
          if (!data) throwError(badInputErrMessage, "BAD_USER_INPUT")
          const { role } = data
          if (!role) throwError(badInputErrMessage, "BAD_USER_INPUT")

          // Call the api.
          const { hasRole } = await dataSources.kmsAPI.hasRoleFollow(role)
          return hasRole
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * @dev The process to follow a profile.
     * @param profileId {number} - a profile token id
     */
    t.field("follow", {
      type: nonNull("WriteResult"),
      args: { input: nonNull("FollowInput") },
      async resolve(_root, { input }, { dataSources, idToken }) {
        try {
          // User must logged in.
          if (!idToken) throwError(authErrMessage, "UNAUTHENTICATED")

          // Validation.
          if (!input) throwError(badInputErrMessage, "BAD_USER_INPUT")
          const { followerId, followeeId } = input
          if (
            !followerId ||
            typeof followerId !== "number" ||
            !followeeId ||
            typeof followeeId !== "number"
          )
            throwError(badInputErrMessage, "BAD_USER_INPUT")

          // Call the api.
          return dataSources.kmsAPI.follow({ followerId, followeeId })
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * @dev Estimate gas used to follow.
     * @param input - refer to FollowInput type
     */
    t.field("estimateGasFollow", {
      type: nonNull("EstimateGasResult"),
      args: { input: nonNull("FollowInput") },
      async resolve(_roote, { input }, { dataSources, idToken }) {
        try {
          // User must logged in.
          if (!idToken) throwError(authErrMessage, "UNAUTHENTICATED")

          // Validation.
          if (!input) throwError(badInputErrMessage, "BAD_USER_INPUT")
          const { followerId, followeeId } = input
          if (
            !followerId ||
            typeof followerId !== "number" ||
            !followeeId ||
            typeof followeeId !== "number"
          )
            throwError(badInputErrMessage, "BAD_USER_INPUT")

          // Call the api.
          return dataSources.kmsAPI.estimateGasFollow({
            followerId,
            followeeId,
          })
        } catch (error) {
          throw error
        }
      },
    })
  },
})
