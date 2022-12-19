import {
  extendType,
  nonNull,
  inputObjectType,
  enumType,
  objectType,
  nullable,
} from "nexus"

import { authErrMessage, badInputErrMessage, throwError } from "./Error"

/**
 * Role enum
 * @dev Use this Role enum across all types (Profile, Publish, Follow, Like).
 */
export const Role = enumType({
  name: "Role",
  members: ["DEFAULT_ADMIN_ROLE", "ADMIN_ROLE", "UPGRADER_ROLE"],
})

/**
 * Required input to check user's role.
 * @dev Use this input across all types (Profile, Publish, Follow, Like).
 * @param role {Role}
 */
export const HasRoleInput = inputObjectType({
  name: "HasRoleInput",
  definition(t) {
    t.nonNull.field("role", { type: "Role" })
  },
})

/**
 * The object containing required data to create a profile.
 * @param handle {string} - a handle
 * @param imageURI {string} - a uri of the image to be used as a profile image, can be empty.
 */
export const CreateProfileInput = inputObjectType({
  name: "CreateProfileInput",
  definition(t) {
    t.nonNull.string("handle")
    t.string("imageURI")
  },
})

/**
 * The object containing required data to update profile image.
 * @param profileId {number} - a token id of the profile token
 * @param imageURI {string} - a uri of the image to be used as a profile image
 *
 */
export const UpdateProfileImageInput = inputObjectType({
  name: "UpdateProfileImageInput",
  definition(t) {
    t.nonNull.int("tokenId")
    t.nonNull.string("imageURI")
  },
})

/**
 * Returned type of all write operations.
 */
export const WriteResult = objectType({
  name: "WriteResult",
  definition(t) {
    t.nonNull.string("status")
  },
})

/**
 * Profile struct object type
 */
export const ProfileToken = objectType({
  name: "ProfileToken",
  definition(t) {
    t.nonNull.int("tokenId")
    t.nonNull.string("owner")
    t.nonNull.string("handle")
    t.nonNull.string("imageURI")
  },
})

/**
 * The return object type for estimate gas operations.
 * @param gas {string}
 */
export const EstimateGasResult = objectType({
  name: "EstimateGasResult",
  definition(t) {
    t.nonNull.string("gas")
  },
})

/**
 * The return object type token uri.
 * @param uri {string}
 */
export const TokenURIResult = objectType({
  name: "TokenURIResult",
  definition(t) {
    t.nonNull.string("uri")
  },
})

export const ProfileQuery = extendType({
  type: "Query",
  definition(t) {
    /**
     * @dev Get user's default profile
     */
    t.field("getDefaultProfile", {
      type: nullable("ProfileToken"),
      async resolve(_root, _args, { dataSources, idToken }) {
        try {
          // User must logged in.
          if (!idToken) throwError(authErrMessage, "UNAUTHENTICATED")

          // Call the api.
          const { token } = await dataSources.kmsAPI.getDefaultProfile()
          return token
        } catch (error) {
          console.log("error -->", error)
          // Return null if no profile found or error occurred so the process can continue.
          return null
        }
      },
    })

    /**
     * @dev Get token uri.
     */
    t.field("getProfileImageURI", {
      type: nullable("TokenURIResult"),
      args: { tokenId: nonNull("Int") },
      async resolve(_root, { tokenId }, { dataSources }) {
        try {
          // Validation.
          if (!tokenId || typeof tokenId !== "number")
            throwError(badInputErrMessage, "BAD_USER_INPUT")

          // Call the api.
          return dataSources.kmsAPI.getProfileImage(tokenId)
        } catch (error) {
          // Return null if no profile found or error occurred.
          return null
        }
      },
    })
  },
})

export const ProfileMutation = extendType({
  type: "Mutation",
  definition(t) {
    /**
     * @dev Check if an address has a specific role.
     */
    t.field("hasRoleProfile", {
      type: nonNull("Boolean"),
      args: { data: nonNull("HasRoleInput") },
      async resolve(_roote, { data }, { dataSources }) {
        try {
          // Validation.
          if (!data) throwError(badInputErrMessage, "BAD_USER_INPUT")
          const { role } = data
          if (!role) throwError(badInputErrMessage, "BAD_USER_INPUT")

          // Call the api.
          const { hasRole } = await dataSources.kmsAPI.hasRoleProfile(role)
          return hasRole
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * @dev The process to create profile nft for users who signed in with traditional providers (phone | email | google).
     * @param input - see CreateProfileInput type
     */
    t.field("createProfile", {
      type: nonNull("WriteResult"),
      args: { input: nonNull("CreateProfileInput") },
      async resolve(_root, { input }, { dataSources, idToken }) {
        try {
          // User must logged in.
          if (!idToken) throwError(authErrMessage, "UNAUTHENTICATED")

          // Validation.
          if (!input) throwError(badInputErrMessage, "BAD_USER_INPUT")
          const { handle, imageURI } = input
          // imageURI can be empty.
          if (!handle) throwError(badInputErrMessage, "BAD_USER_INPUT")

          // Call the api.
          return dataSources.kmsAPI.createProfile({
            handle,
            imageURI: imageURI || "",
          })
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * @dev The process to update profile for users who signed in with traditional providers (phone | email | google).
     * @dev use CreateProfileResult type as a returned type.
     * @param input - see UpdateProfileImageInput type.
     */
    t.field("updateProfileImage", {
      type: nonNull("WriteResult"),
      args: { input: nonNull("UpdateProfileImageInput") },
      async resolve(_root, { input }, { dataSources, idToken }) {
        try {
          // User must logged in.
          if (!idToken) throwError(authErrMessage, "UNAUTHENTICATED")

          // Validattion.
          if (!input) throwError(badInputErrMessage, "BAD_USER_INPUT")
          const { tokenId, imageURI } = input
          if (!tokenId || typeof tokenId !== "number" || !imageURI)
            throwError(badInputErrMessage, "BAD_USER_INPUT")

          // Call the api.
          return dataSources.kmsAPI.updateProfileImage({
            tokenId,
            imageURI,
          })
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * @dev The process to set profile as default for users who signed in with traditional providers (phone | email | google).
     * @param profileId {number} - a profile token id
     */
    t.field("setDefaultProfile", {
      type: nonNull("WriteResult"),
      args: { handle: nonNull("String") },
      async resolve(_root, { handle }, { dataSources, idToken }) {
        try {
          // User must logged in.
          if (!idToken) throwError(authErrMessage, "UNAUTHENTICATED")

          // Validation.
          if (!handle) throwError(badInputErrMessage, "BAD_USER_INPUT")

          // Call the api.
          return dataSources.kmsAPI.setDefaultProfile(handle)
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * @dev Validate handle length and uniqueness
     * @param handle {string}
     */
    t.field("validateHandle", {
      type: nonNull("Boolean"),
      args: { handle: nonNull("String") },
      async resolve(_root, { handle }, { dataSources }) {
        try {
          // Validation.
          if (!handle) throwError(badInputErrMessage, "BAD_USER_INPUT")

          // Call the api.
          // Has to lowercase the handle before sending to the blockchain.
          const { valid } = await dataSources.kmsAPI.verifyHandle(
            handle.toLowerCase()
          )
          return valid
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * @dev Estimate gas used for creating a profile nft.
     * @param input - refer to CreateProfileInput type
     */
    t.field("estimateGasCreateProfile", {
      type: nonNull("EstimateGasResult"),
      args: { input: nonNull("CreateProfileInput") },
      async resolve(_roote, { input }, { dataSources, idToken }) {
        try {
          // User must logged in.
          if (!idToken) throwError(authErrMessage, "UNAUTHENTICATED")

          // Validation.
          if (!input) throwError(badInputErrMessage, "BAD_USER_INPUT")
          const { handle, imageURI } = input
          // imageURI can be empty.
          if (!handle) throwError(badInputErrMessage, "BAD_USER_INPUT")
          // Make sure to lower case handle or will get error.
          const formattedHandle = handle.toLowerCase()
          // Check if handle has correct length and unique.
          const { valid } = await dataSources.kmsAPI.verifyHandle(
            formattedHandle
          )
          if (!valid) throw new Error("This handle is taken")

          // Call the api.
          return dataSources.kmsAPI.estimateGasCreateProfile({
            handle,
            imageURI: imageURI || "",
          })
        } catch (error) {
          throw error
        }
      },
    })
  },
})
