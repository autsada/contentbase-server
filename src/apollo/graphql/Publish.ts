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

export const Category = enumType({
  name: "Category",
  members: [
    "Empty",
    "Music",
    "Movies",
    "Entertainment",
    "Sports",
    "Food",
    "Travel",
    "Gaming",
    "News",
    "Animals",
    "Education",
    "Science",
    "Technology",
    "Programming",
    "LifeStyle",
    "Vehicles",
    "Children",
    "Women",
    "Men",
    "Other",
    "NotExist",
  ],
})

/**",
 * The object containing required data to create a publish.
 * @param creatorId {number} - a token id of the creator's profile
 * @param imageURI {string} - a publish's thumbnail image uri
 * @param contentURI {string} - a publish's content uri
 * @param metadataURI {string} - a publish's metadata file uri
 * @param title {string} - a publish's title
 * @param description {string} - a publish's description
 * @param primaryCategory {enum} - a primary category of a publish
 * @param secondaryCategory {enum} - a secondary category of a publish
 * @param tertiaryCategory {enum} - a tertiary category of a publish
 */
export const CreatePublishInput = inputObjectType({
  name: "CreatePublishInput",
  definition(t) {
    t.nonNull.int("creatorId")
    t.nonNull.string("imageURI")
    t.nonNull.string("contentURI")
    t.nonNull.string("metadataURI")
    t.nonNull.string("title")
    t.nonNull.string("description")
    t.nonNull.field("primaryCategory", { type: nonNull("Category") })
    t.nonNull.field("secondaryCategory", { type: nonNull("Category") })
    t.nonNull.field("tertiaryCategory", { type: nonNull("Category") })
  },
})

/**
 * The object containing required data to update a publish.
 * @param tokenId {number} - a token id of the publish to be updated
 * @param creatorId {number} - a profile token id that owns the publish
 * @param imageURI {string} - a publish's thumbnail image uri
 * @param contentURI {string} - a publish's content uri
 * @param title {string} - a publish's title
 * @param description {string} - a publish's description
 * @param metadataURI {string} - a publish's metadata file uri
 * @param primaryCategory {enum} - a primary category of a publish
 * @param secondaryCategory {enum} - a secondary category of a publish
 * @param tertiaryCategory {enum} - a tertiary category of a publish
 */
export const UpdatePublishInput = inputObjectType({
  name: "UpdatePublishInput",
  definition(t) {
    t.nonNull.int("tokenId")
    t.nonNull.int("creatorId")
    t.nonNull.string("imageURI")
    t.nonNull.string("contentURI")
    t.nonNull.string("metadataURI")
    t.nonNull.string("title")
    t.string("description")
    t.nonNull.field("primaryCategory", { type: "Category" })
    t.nonNull.field("secondaryCategory", { type: "Category" })
    t.nonNull.field("tertiaryCategory", { type: "Category" })
  },
})

/**
 * Publish struct object type
 */
export const PublishToken = objectType({
  name: "PublishToken",
  definition(t) {
    t.nonNull.int("tokenId")
    t.nonNull.string("owner")
    t.nonNull.int("creatorId")
    t.nonNull.int("likes")
    t.nonNull.int("disLikes")
    t.nonNull.string("imageURI")
    t.nonNull.string("contentURI")
    t.nonNull.string("metadataURI")
  },
})

export const AddressResult = objectType({
  name: "AddressResult",
  definition(t) {
    t.nonNull.string("address")
  },
})

export const FeeResult = objectType({
  name: "FeeResult",
  definition(t) {
    t.nonNull.float("fee")
  },
})

export const PublishQuery = extendType({
  type: "Query",
  definition(t) {
    /**
     * @dev Get one publish
     */
    t.field("getPublish", {
      type: nullable("PublishToken"),
      args: { publishId: nonNull("Int") },
      async resolve(_root, { publishId }, { dataSources }) {
        try {
          // Validation.
          if (!publishId || typeof publishId !== "number")
            throw new UserInputError(badRequestErrMessage)

          // Call the api.
          const { token } = await dataSources.kmsAPI.getPublish(publishId)
          return token
        } catch (error) {
          // Return null if no profile found or error occurred.
          return null
        }
      },
    })

    /**
     * @dev Get token uri.
     */
    t.field("getPublishTokenURI", {
      type: nullable("TokenURIResult"),
      args: { tokenId: nonNull("Int") },
      async resolve(_root, { tokenId }, { dataSources }) {
        try {
          // Validation.
          if (!tokenId || typeof tokenId !== "number")
            throw new UserInputError(badRequestErrMessage)

          // Call the api.
          return dataSources.kmsAPI.getPublishTokenURI(tokenId)
        } catch (error) {
          // Return null if no profile found or error occurred.
          return null
        }
      },
    })

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
    t.field("getProfileContractAddress", {
      type: nonNull("AddressResult"),
      async resolve(_root, _args, { dataSources }) {
        try {
          // Call the api.
          return dataSources.kmsAPI.getProfileAddress()
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

export const PublishMutation = extendType({
  type: "Mutation",
  definition(t) {
    /**
     * @dev Check if an address has a specific role.
     */
    t.field("hasRolePublish", {
      type: nonNull("Boolean"),
      args: { data: nonNull("HasRoleInput") },
      async resolve(_roote, { data }, { dataSources, user }) {
        try {
          // User must logged in.
          if (!user) throw new AuthenticationError(authErrMessage)
          const uid = user.uid

          // Validation.
          if (!uid) throw new ForbiddenError(forbiddenErrMessage)
          if (!data) throw new UserInputError(badRequestErrMessage)
          const { role } = data
          if (!role) throw new UserInputError(badRequestErrMessage)

          // Call the api.
          const { hasRole } = await dataSources.kmsAPI.hasRolePublish(uid, role)
          return hasRole
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * @dev The process to create publish nft
     * @param input see CreatePublishInput
     */
    t.field("createPublish", {
      type: nonNull("WriteResult"),
      args: { input: nonNull("CreatePublishInput") },
      async resolve(_root, { input }, { dataSources, user }) {
        try {
          // User must logged in.
          if (!user) throw new AuthenticationError(authErrMessage)
          const uid = user.uid

          // Validation.
          if (!uid) throw new ForbiddenError(forbiddenErrMessage)
          if (!input) throw new UserInputError(badRequestErrMessage)
          const {
            creatorId,
            imageURI,
            contentURI,
            metadataURI,
            title,
            primaryCategory,
            secondaryCategory,
            tertiaryCategory,
          } = input
          // description can be empty string.
          if (
            typeof creatorId !== "number" ||
            !creatorId ||
            !imageURI ||
            !contentURI ||
            !metadataURI ||
            !title ||
            !primaryCategory ||
            !secondaryCategory ||
            !tertiaryCategory
          )
            throw new UserInputError(badRequestErrMessage)

          // Call the api.
          return dataSources.kmsAPI.createPublish(uid, input)
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * @dev The process to update publish nft
     * @param input - see UpdatePublishInput
     */
    t.field("updatePublish", {
      type: nonNull("WriteResult"),
      args: { input: nonNull("UpdatePublishInput") },
      async resolve(_root, { input }, { dataSources, user }) {
        try {
          // User must logged in.
          if (!user) throw new AuthenticationError(authErrMessage)
          const uid = user.uid

          // Validation.
          if (!uid) throw new ForbiddenError(forbiddenErrMessage)
          if (!input) throw new UserInputError(badRequestErrMessage)
          const {
            tokenId,
            creatorId,
            imageURI,
            contentURI,
            metadataURI,
            title,
            primaryCategory,
            secondaryCategory,
            tertiaryCategory,
          } = input
          // description can be empty string.
          if (
            !tokenId ||
            typeof tokenId !== "number" ||
            !creatorId ||
            typeof creatorId !== "number" ||
            !imageURI ||
            !contentURI ||
            !metadataURI ||
            !title ||
            !primaryCategory ||
            !secondaryCategory ||
            !tertiaryCategory
          )
            throw new UserInputError(badRequestErrMessage)

          // Call the api.
          return dataSources.kmsAPI.updatePublish(uid, input)
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * @dev The process to delete publish nft
     */
    t.field("deletePublish", {
      type: nonNull("WriteResult"),
      args: { publishId: nonNull("Int"), creatorId: nonNull("Int") },
      async resolve(_root, { publishId, creatorId }, { dataSources, user }) {
        try {
          // User must logged in.
          if (!user) throw new AuthenticationError(authErrMessage)
          const uid = user.uid

          // Validation.
          if (!uid) throw new ForbiddenError(forbiddenErrMessage)
          if (
            !publishId ||
            typeof publishId !== "number" ||
            !creatorId ||
            typeof creatorId !== "number"
          )
            throw new UserInputError(badRequestErrMessage)

          // Call the api.
          return dataSources.kmsAPI.deletePublish(uid, publishId, creatorId)
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
      async resolve(_root, { publishId, profileId }, { dataSources, user }) {
        try {
          // User must logged in.
          if (!user) throw new AuthenticationError(authErrMessage)
          const uid = user.uid

          // Validation.
          if (!uid) throw new ForbiddenError(forbiddenErrMessage)
          if (
            !publishId ||
            typeof publishId !== "number" ||
            !profileId ||
            typeof profileId !== "number"
          )
            throw new UserInputError(badRequestErrMessage)

          // Call the api.
          return dataSources.kmsAPI.likePublish(uid, publishId, profileId)
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
      async resolve(_root, { publishId, profileId }, { dataSources, user }) {
        try {
          // User must logged in.
          if (!user) throw new AuthenticationError(authErrMessage)
          const uid = user.uid

          // Validation.
          if (!uid) throw new ForbiddenError(forbiddenErrMessage)
          if (
            !publishId ||
            typeof publishId !== "number" ||
            !profileId ||
            typeof profileId !== "number"
          )
            throw new UserInputError(badRequestErrMessage)

          // Call the api.
          return dataSources.kmsAPI.disLikePublish(uid, publishId, profileId)
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * @dev Estimate gas used for creating a publish nft.
     * @param input - refer to CreatePublishInput type
     */
    t.field("estimateGasCreatePublish", {
      type: nonNull("EstimateGasResult"),
      args: { input: nonNull("CreatePublishInput") },
      async resolve(_roote, { input }, { dataSources, user }) {
        try {
          // User must logged in.
          if (!user) throw new AuthenticationError(authErrMessage)
          const uid = user?.uid

          // Validation.
          if (!uid) throw new ForbiddenError(forbiddenErrMessage)
          if (!input) throw new UserInputError(badRequestErrMessage)
          const {
            creatorId,
            imageURI,
            contentURI,
            metadataURI,
            title,
            primaryCategory,
            secondaryCategory,
            tertiaryCategory,
          } = input
          // description can be empty string.
          if (
            typeof creatorId !== "number" ||
            !creatorId ||
            !imageURI ||
            !contentURI ||
            !metadataURI ||
            !title ||
            !primaryCategory ||
            !secondaryCategory ||
            !tertiaryCategory
          )
            throw new UserInputError(badRequestErrMessage)

          // Call the api.
          const { gas } = await dataSources.kmsAPI.estimateGasCreatePublish(
            uid,
            input
          )
          return { gas }
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
      async resolve(_roote, { publishId, profileId }, { dataSources, user }) {
        try {
          // User must logged in.
          if (!user) throw new AuthenticationError(authErrMessage)
          const uid = user?.uid

          // Validation.
          if (!uid) throw new ForbiddenError(forbiddenErrMessage)
          if (
            !publishId ||
            typeof publishId !== "number" ||
            !profileId ||
            typeof profileId !== "number"
          )
            throw new UserInputError(badRequestErrMessage)

          // Call the api.
          const { gas } = await dataSources.kmsAPI.estimateGasLikePublish(
            uid,
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
