import {
  extendType,
  nonNull,
  stringArg,
  list,
  inputObjectType,
  enumType,
  objectType,
} from "nexus"
import {
  AuthenticationError,
  UserInputError,
  ForbiddenError,
} from "apollo-server-express"

import { profilesCollection } from "../../lib"
import type { NexusGenObjects } from "../typegen"

const authErrMessage = "*** You must be logged in ***"
const badRequestErrMessage = "Bad Request"

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
 * @param imageURI {string} - a uri of the image to be used as a profile image, can be empty
 * @param tokenURI {string} - a uri of the token's metadata
 *
 */
export const CreateProfileInput = inputObjectType({
  name: "CreateProfileInput",
  definition(t) {
    t.nonNull.string("handle")
    t.string("imageURI")
    t.nonNull.string("tokenURI")
  },
})

/**
 * Returned type of CreateProfileNft mutation.
 * @dev see ProfileToken.
 * @dev use this type for the returned type of other mutations that return token as well.
 */
export const CreateProfileResult = objectType({
  name: "CreateProfileResult",
  definition(t) {
    t.nonNull.int("tokenId")
    t.nonNull.string("owner")
    t.nonNull.string("handle")
    t.nonNull.string("imageURI")
  },
})

/**
 * The object containing required data to update profile image.
 * @param profileId {number} - a token id of the profile token
 * @param tokenURI {string} - a uri of the token's metadata
 * @param imageURI {string} - a uri of the image to be used as a profile image
 *
 */
export const UpdateProfileImageInput = inputObjectType({
  name: "UpdateProfileImageInput",
  definition(t) {
    t.nonNull.int("profileId")
    t.nonNull.string("tokenURI")
    t.nonNull.string("imageURI")
  },
})

/**
 * The return object type for estimate create Profile NFT gas.
 * @param gas {number}
 */
export const EstimateCreateProfileGasResult = objectType({
  name: "EstimateCreateProfileGasResult",
  definition(t) {
    t.nonNull.string("gas")
  },
})

/**
 * Profile Token Type
 * @dev this is the object type for data that will be stored in Firestore.
 * @param id {string} - Firestore document id
 * @param uid {string} - a user auth uid
 * @param tokenId {number} - a Profile token id
 * @param owner {string} - a blockchain address that owns the token
 * @param handle {string} - a handle of the profile
 * @param imageURI {string} - a profile image uri
 * @param displayedHandle {string} - original handle without lowercase string and prefix with "@"
 * @param createdAt {string}
 * @param updatedAt {string}
 */
export const ProfileToken = objectType({
  name: "ProfileToken",
  definition(t) {
    t.nonNull.string("id")
    t.nonNull.string("uid")
    t.nonNull.int("tokenId")
    t.nonNull.string("owner")
    t.nonNull.string("handle")
    t.nonNull.string("imageURI")
    t.nonNull.string("displayedHandle")
    t.nonNull.string("createdAt")
    t.string("updatedAt")
  },
})

export const ProfileQuery = extendType({
  type: "Query",
  definition(t) {
    /**
     * @dev Get user's default profile
     */
    t.field("getDefaultProfile", {
      type: nonNull("CreateProfileResult"),
      async resolve(_root, _args, { dataSources, user }) {
        try {
          // if (!user) throw new AuthenticationError(authErrMessage)
          // const uid = user.uid
          const uid = "abc123"

          const { token } = await dataSources.kmsAPI.getDefaultProfile(uid)

          return token
        } catch (error) {
          throw error
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
      async resolve(_roote, { data }, { dataSources, user }) {
        try {
          // if (!user) throw new AuthenticationError(authErrMessage)
          // const uid = user.uid
          const uid = "abc123"

          if (!data) throw new UserInputError(badRequestErrMessage)
          const { role } = data

          const { hasRole } = await dataSources.kmsAPI.hasRoleProfile(uid, role)

          return hasRole
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * @dev The process to create profile nft for users who signed in with traditional providers (phone | email | google).
     * @param input - refer to CreateProfileInput type
     */
    t.field("createProfileNft", {
      type: nonNull("CreateProfileResult"),
      args: { input: nonNull("CreateProfileInput") },
      async resolve(_root, { input }, { dataSources, user }) {
        try {
          // User must be already logged in
          // if (!user) throw new AuthenticationError(authErrMessage)
          // const uid = user.uid
          const uid = "abc123"

          // Validate input.
          if (!input) throw new UserInputError(badRequestErrMessage)

          const { handle, imageURI, tokenURI } = input

          // imageURI can be empty.
          if (!handle || !tokenURI)
            throw new UserInputError(badRequestErrMessage)

          // Make sure to lower case handle or will get error.
          const formattedHandle = handle.toLowerCase()

          // Check if handle has correct length and unique.
          const { valid } = await dataSources.kmsAPI.verifyHandle(
            formattedHandle
          )

          if (!valid) throw new UserInputError("This handle is taken")

          // Create a profile
          const { token } = await dataSources.kmsAPI.createProfileNft(uid, {
            handle: formattedHandle,
            imageURI: imageURI || "",
            tokenURI,
          })

          if (!token) throw new Error("Create profile nft failed.")

          // Save new token in Firestore (profiles collection), must include original handle (the handle before lowercase prefixed with "@") for displaying on the UI.
          await dataSources.firestoreAPI.createProfileDoc({
            ...token,
            uid,
            displayedHandle: `@${handle}`,
          })

          return token
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
      type: nonNull("CreateProfileResult"),
      args: { input: nonNull("UpdateProfileImageInput") },
      async resolve(_root, { input }, { dataSources, user }) {
        try {
          // User must be already logged in
          // if (!user) throw new AuthenticationError(authErrMessage)
          // const uid = user.uid
          const uid = "abc123"

          // Validate input.
          if (!input) throw new UserInputError(badRequestErrMessage)

          const { profileId, imageURI, tokenURI } = input

          if (typeof profileId !== "number" || !imageURI || !tokenURI)
            throw new UserInputError(badRequestErrMessage)

          // Update the profile
          const { token } = await dataSources.kmsAPI.updateProfileImage(uid, {
            profileId,
            imageURI,
            tokenURI,
          })

          if (!token) throw new Error("Update profile image failed.")

          // Update the profile doc in Firestore.
          // Search the profile doc by token id to get the document id first.
          const { profile } =
            await dataSources.firestoreAPI.searchProfileByTokenId(profileId)

          if (profile) {
            await dataSources.firestoreAPI.updateProfileDoc(profile.id, token)
          }

          return token
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
      type: nonNull("CreateProfileResult"),
      args: { profileId: nonNull("Int") },
      async resolve(_root, { profileId }, { dataSources, user }) {
        try {
          // User must be already logged in
          // if (!user) throw new AuthenticationError(authErrMessage)
          // const uid = user.uid
          const uid = "abc123"

          if (!profileId) throw new UserInputError("Bad request")

          const { token } = await dataSources.kmsAPI.setDefaultProfile(
            uid,
            profileId
          )

          if (!token)
            throw new Error(
              "Error occured while attempting to update profile image."
            )

          return token
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
      args: { handle: nonNull(stringArg()) },
      async resolve(_root, { handle }, { dataSources }) {
        try {
          if (!handle) throw new UserInputError(badRequestErrMessage)

          // Has to lowercase the handle before sending to the blockchain
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
     * @dev Estimate gas used for creating a profile
     * @param input - refer to CreateProfileInput type
     */
    t.field("estimateCreateProfileGas", {
      type: nonNull("EstimateCreateProfileGasResult"),
      args: { input: nonNull("CreateProfileInput") },
      async resolve(_roote, { input }, { dataSources, user }) {
        try {
          // // User must be already logged in
          // if (!user) throw new AuthenticationError(authErrMessage)
          // const uid = user?.uid
          const uid = "abc123"

          // Validate input.
          if (!input) throw new UserInputError(badRequestErrMessage)

          const { handle, imageURI, tokenURI } = input

          // imageURI can be empty.
          if (!handle || !tokenURI)
            throw new UserInputError(badRequestErrMessage)

          // Make sure to lower case handle or will get error.
          const formattedHandle = handle.toLowerCase()

          // Check if handle has correct length and unique.
          const { valid } = await dataSources.kmsAPI.verifyHandle(
            formattedHandle
          )

          if (!valid) throw new UserInputError("This handle is taken")

          const estimateGasResult =
            await dataSources.kmsAPI.estimateCreateProfileGas(uid, {
              handle,
              imageURI: imageURI || "",
              tokenURI,
            })

          return { gas: estimateGasResult.gas }
        } catch (error) {
          throw error
        }
      },
    })
  },
})
