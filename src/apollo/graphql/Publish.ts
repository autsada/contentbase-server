import {
  enumType,
  objectType,
  inputObjectType,
  extendType,
  nonNull,
  nullable,
} from "nexus"

import { authErrMessage, badInputErrMessage, throwError } from "./Error"

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

export const PublishKind = enumType({
  name: "PublishKind",
  members: ["Video", "Short", "Audio", "Blog", "Post"],
})

/**",
 * The object containing required data to create a publish.
 * @param creatorId {number} - a token id of the creator's profile
 * @param contentURI {string} - a publish's content uri
 * @param contentRef {string} - a path to the content stored on the cloud or ipfs
 * @param title {string} - a publish's title
 * @param description {string} - a publish's description
 * @param primaryCategory {enum} - a primary category of a publish
 * @param secondaryCategory {enum} - a secondary category of a publish
 * @param tertiaryCategory {enum} - a tertiary category of a publish
 * @param kind {enum} - a kind of a publish
 */
export const CreatePublishInput = inputObjectType({
  name: "CreatePublishInput",
  definition(t) {
    t.nonNull.int("creatorId")
    t.nonNull.string("contentURI")
    t.nonNull.string("contentRef")
    t.nonNull.string("title")
    t.nonNull.string("description")
    t.nonNull.field("primaryCategory", { type: nonNull("Category") })
    t.nonNull.field("secondaryCategory", { type: nonNull("Category") })
    t.nonNull.field("tertiaryCategory", { type: nonNull("Category") })
    t.nonNull.field("kind", { type: nonNull("PublishKind") })
  },
})

/**
 * The object containing required data to update a publish.
 * @param tokenId {number} - a token id of the publish to be updated
 * @param creatorId {number} - a profile token id that owns the publish
 * @param title {string} - a publish's title
 * @param description {string} - a publish's description
 * @param primaryCategory {enum} - a primary category of a publish
 * @param secondaryCategory {enum} - a secondary category of a publish
 * @param tertiaryCategory {enum} - a tertiary category of a publish
 */
export const UpdatePublishInput = inputObjectType({
  name: "UpdatePublishInput",
  definition(t) {
    t.nonNull.int("tokenId")
    t.nonNull.int("creatorId")
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
    t.nonNull.string("contentURI")
  },
})

export const AddressResult = objectType({
  name: "AddressResult",
  definition(t) {
    t.nonNull.string("address")
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
            throwError(badInputErrMessage, "BAD_USER_INPUT")

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
            throwError(badInputErrMessage, "BAD_USER_INPUT")

          // Call the api.
          return dataSources.kmsAPI.getPublishTokenURI(tokenId)
        } catch (error) {
          // Return null if no profile found or error occurred.
          return null
        }
      },
    })

    /**
     * @dev Get profile contract address.
     */
    t.field("getProfileAddressFromPuiblish", {
      type: nonNull("AddressResult"),
      async resolve(_root, _args, { dataSources }) {
        try {
          // Call the api.
          return dataSources.kmsAPI.getProfileAddressFromPublish()
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
      async resolve(_roote, { data }, { dataSources, idToken }) {
        try {
          // User must logged in.
          if (!idToken) throwError(authErrMessage, "UNAUTHENTICATED")

          // Validation.
          if (!data) throwError(badInputErrMessage, "BAD_USER_INPUT")
          const { role } = data
          if (!role) throwError(badInputErrMessage, "BAD_USER_INPUT")

          // Call the api.
          const { hasRole } = await dataSources.kmsAPI.hasRolePublish(role)
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
      async resolve(_root, { input }, { dataSources, idToken }) {
        try {
          // User must logged in.
          if (!idToken) throwError(authErrMessage, "UNAUTHENTICATED")

          // Validation.
          if (!input) throwError(badInputErrMessage, "BAD_USER_INPUT")
          const {
            creatorId,
            contentURI,
            contentRef,
            title,
            primaryCategory,
            secondaryCategory,
            tertiaryCategory,
            kind,
          } = input
          // description can be empty string.
          if (
            typeof creatorId !== "number" ||
            !creatorId ||
            !contentURI ||
            !contentRef ||
            !title ||
            !primaryCategory ||
            primaryCategory === "Empty" ||
            !secondaryCategory ||
            !tertiaryCategory ||
            !kind ||
            (kind !== "Video" &&
              kind !== "Short" &&
              kind !== "Audio" &&
              kind !== "Blog" &&
              kind !== "Post")
          )
            throwError(badInputErrMessage, "BAD_USER_INPUT")

          // If the `secondaryCategory` is `Empty` and the `tertiaryCategory` is not, swap it so the smart contract will not throw.
          if (secondaryCategory === "Empty" && tertiaryCategory !== "Empty") {
            input.secondaryCategory = tertiaryCategory
            input.tertiaryCategory = "Empty"
          }

          // Call the api.
          return dataSources.kmsAPI.createPublish(input)
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
      async resolve(_root, { input }, { dataSources, idToken }) {
        try {
          // User must logged in.
          if (!idToken) throwError(authErrMessage, "UNAUTHENTICATED")

          // Validation.
          if (!input) throwError(badInputErrMessage, "BAD_USER_INPUT")
          const {
            tokenId,
            creatorId,
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
            !title ||
            !primaryCategory ||
            primaryCategory === "Empty" ||
            !secondaryCategory ||
            !tertiaryCategory
          )
            throwError(badInputErrMessage, "BAD_USER_INPUT")

          // If the `secondaryCategory` is `Empty` and the `tertiaryCategory` is not, swap it so the smart contract will not throw.
          if (secondaryCategory === "Empty" && tertiaryCategory !== "Empty") {
            input.secondaryCategory = tertiaryCategory
            input.tertiaryCategory = "Empty"
          }

          // Call the api.
          return dataSources.kmsAPI.updatePublish(input)
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
      async resolve(_root, { publishId, creatorId }, { dataSources, idToken }) {
        try {
          // User must logged in.
          if (!idToken) throwError(authErrMessage, "UNAUTHENTICATED")

          // Validation.
          if (
            !publishId ||
            typeof publishId !== "number" ||
            !creatorId ||
            typeof creatorId !== "number"
          )
            throwError(badInputErrMessage, "BAD_USER_INPUT")

          // Call the api.
          return dataSources.kmsAPI.deletePublish(publishId, creatorId)
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
      async resolve(_roote, { input }, { dataSources, idToken }) {
        try {
          // User must logged in.
          if (!idToken) throwError(authErrMessage, "UNAUTHENTICATED")

          // Validation.
          if (!input) throwError(badInputErrMessage, "BAD_USER_INPUT")
          const {
            creatorId,
            contentURI,
            title,
            primaryCategory,
            secondaryCategory,
            tertiaryCategory,
          } = input
          // description can be empty string.
          if (
            typeof creatorId !== "number" ||
            !creatorId ||
            !contentURI ||
            !title ||
            !primaryCategory ||
            !secondaryCategory ||
            !tertiaryCategory
          )
            throwError(badInputErrMessage, "BAD_USER_INPUT")

          // Call the api.
          const { gas } = await dataSources.kmsAPI.estimateGasCreatePublish(
            input
          )
          return { gas }
        } catch (error) {
          throw error
        }
      },
    })
  },
})
