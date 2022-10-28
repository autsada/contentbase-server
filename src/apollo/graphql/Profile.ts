import {
  extendType,
  nonNull,
  stringArg,
  inputObjectType,
  enumType,
  objectType,
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
 * Returned type of CreateProfileNft mutation.
 * @dev see ProfileToken.
 * @dev use this type for the returned type of other mutations that return Profile token as well.
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
 * @param imageURI {string} - a uri of the image to be used as a profile image
 *
 */
export const UpdateProfileImageInput = inputObjectType({
  name: "UpdateProfileImageInput",
  definition(t) {
    t.nonNull.int("profileId")
    t.nonNull.string("imageURI")
  },
})

/**
 * The return object type for estimate create Profile NFT gas.
 * @param gas {number}
 */
export const EstimateCreateNFTGasResult = objectType({
  name: "EstimateCreateNFTGasResult",
  definition(t) {
    t.nonNull.string("gas")
  },
})

export const ProfileQuery = extendType({
  type: "Query",
  definition(t) {
    /**
     * @dev Get user's default profile
     */
    t.field("getDefaultProfile", {
      type: nullable("CreateProfileResult"),
      async resolve(_root, _args, { dataSources, user }) {
        try {
          if (!user) throw new AuthenticationError(authErrMessage)
          const uid = user.uid

          if (!uid) throw new ForbiddenError(forbiddenErrMessage)

          const { token } = await dataSources.kmsAPI.getDefaultProfile(uid)

          return token
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
      async resolve(_roote, { data }, { dataSources, user }) {
        try {
          if (!user) throw new AuthenticationError(authErrMessage)
          const uid = user.uid

          if (!uid) throw new ForbiddenError(forbiddenErrMessage)

          if (!data) throw new UserInputError(badRequestErrMessage)
          const { role } = data

          if (!role) throw new UserInputError(badRequestErrMessage)

          const { hasRole } = await dataSources.kmsAPI.hasRoleProfile(uid, role)

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
    t.field("createProfileNft", {
      type: nonNull("CreateProfileResult"),
      args: { input: nonNull("CreateProfileInput") },
      async resolve(_root, { input }, { dataSources, user }) {
        try {
          // User must be already logged in
          if (!user) throw new AuthenticationError(authErrMessage)
          const uid = user.uid

          if (!uid) throw new ForbiddenError(forbiddenErrMessage)

          // Validate input.
          if (!input) throw new UserInputError(badRequestErrMessage)

          const { handle, imageURI } = input

          // Validate input.
          // imageURI can be empty.
          if (!handle) throw new UserInputError(badRequestErrMessage)

          // Create a profile
          const { token } = await dataSources.kmsAPI.createProfileNft(uid, {
            handle,
            imageURI: imageURI || "",
          })

          if (!token) throw new Error("Create profile nft failed.")

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
          if (!user) throw new AuthenticationError(authErrMessage)
          const uid = user.uid

          if (!uid) throw new ForbiddenError(forbiddenErrMessage)

          // Validate input.
          if (!input) throw new UserInputError(badRequestErrMessage)

          const { profileId, imageURI } = input

          // Validate input.
          if (typeof profileId !== "number" || !profileId || !imageURI)
            throw new UserInputError(badRequestErrMessage)

          // Update the profile
          const { token } = await dataSources.kmsAPI.updateProfileImage(uid, {
            profileId,
            imageURI,
          })

          if (!token) throw new Error("Update profile image failed.")

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
          if (!user) throw new AuthenticationError(authErrMessage)
          const uid = user.uid

          if (!uid) throw new ForbiddenError(forbiddenErrMessage)

          if (typeof profileId !== "number" || !profileId)
            throw new UserInputError("Bad request")

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
     * @dev Estimate gas used for creating a profile nft.
     * @param input - refer to CreateProfileInput type
     */
    t.field("estimateCreateProfileGas", {
      type: nonNull("EstimateCreateNFTGasResult"),
      args: { input: nonNull("CreateProfileInput") },
      async resolve(_roote, { input }, { dataSources, user }) {
        try {
          // User must be already logged in
          if (!user) throw new AuthenticationError(authErrMessage)
          const uid = user?.uid

          if (!uid) throw new ForbiddenError(forbiddenErrMessage)

          // Validate input.
          if (!input) throw new UserInputError(badRequestErrMessage)

          const { handle, imageURI } = input

          // Validate input.
          // imageURI can be empty.
          if (!handle) throw new UserInputError(badRequestErrMessage)

          // Make sure to lower case handle or will get error.
          const formattedHandle = handle.toLowerCase()

          // Check if handle has correct length and unique.
          const { valid } = await dataSources.kmsAPI.verifyHandle(
            formattedHandle
          )

          if (!valid) throw new UserInputError("This handle is taken")

          const { gas } = await dataSources.kmsAPI.estimateCreateProfileGas(
            uid,
            {
              handle,
              imageURI: imageURI || "",
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
