import {
  objectType,
  inputObjectType,
  extendType,
  nonNull,
  enumType,
} from "nexus"
import {
  AuthenticationError,
  UserInputError,
  ForbiddenError,
} from "apollo-server-express"

const authErrMessage = "*** You must be logged in ***"
const badRequestErrMessage = "Bad Request"
const forbiddenErrMessage = "Forbidden"

/**",
 * The object containing required data to comment on a publish.
 * @param parentId {number} - a publish token id
 * @param creatorId {number} - a token id of the creator's profile
 * @param contentURI {string} - a comment's content uri
 * @param text {string} - a comment's text
 */
export const CreateCommentInput = inputObjectType({
  name: "CreateCommentInput",
  definition(t) {
    t.nonNull.int("parentId")
    t.nonNull.int("creatorId")
    t.nonNull.string("contentURI")
    t.nonNull.string("text")
  },
})

/**",
 * The object containing required data to create a comment.
 * @param tokenId {number} - a token id to be updated
 * @param creatorId {number} - a token id of the creator's profile
 * @param contentURI {string} - a publish's content uri
 * @param text {string} - a comment's text
 */
export const UpdateCommentInput = inputObjectType({
  name: "UpdateCommentInput",
  definition(t) {
    t.nonNull.int("tokenId")
    t.nonNull.int("creatorId")
    t.nonNull.string("contentURI")
    t.nonNull.string("text")
  },
})

export const CommentType = enumType({
  name: "CommentType",
  members: ["PUBLISH", "COMMENT"],
})

/**
 * Comment struct object type
 */
export const CommentToken = objectType({
  name: "CommentToken",
  definition(t) {
    t.nonNull.int("tokenId")
    t.nonNull.string("owner")
    t.nonNull.int("creatorId")
    t.nonNull.int("parentId")
    t.nonNull.string("contentURI")
    t.nonNull.field("commentType", { type: nonNull("CommentType") })
  },
})

export const CommentQuery = extendType({
  type: "Query",
  definition(t) {
    /**
     * @dev Get one publish
     */
    t.field("getComment", {
      type: nonNull("CommentToken"),
      args: { commentId: nonNull("Int") },
      async resolve(_root, { commentId }, { dataSources }) {
        try {
          // Validation.
          if (!commentId || typeof commentId !== "number")
            throw new UserInputError(badRequestErrMessage)

          // Call the api.
          const { token } = await dataSources.kmsAPI.getComment(commentId)
          return token
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * @dev Get token uri.
     */
    t.field("getCommentTokenURI", {
      type: nonNull("TokenURIResult"),
      args: { tokenId: nonNull("Int") },
      async resolve(_root, { tokenId }, { dataSources }) {
        try {
          // Validation.
          if (!tokenId || typeof tokenId !== "number")
            throw new UserInputError(badRequestErrMessage)

          // Call the api.
          return dataSources.kmsAPI.getCommentTokenURI(tokenId)
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * @dev Get profile contract address.
     */
    t.field("getProfileAddressFromComment", {
      type: nonNull("AddressResult"),
      async resolve(_root, _args, { dataSources }) {
        try {
          // Call the api.
          return dataSources.kmsAPI.getProfileAddressFromComment()
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * @dev Get publish contract address.
     */
    t.field("getPublishAddressFromComment", {
      type: nonNull("AddressResult"),
      async resolve(_root, _args, { dataSources }) {
        try {
          // Call the api.
          return dataSources.kmsAPI.getPublishAddressFromComment()
        } catch (error) {
          throw error
        }
      },
    })
  },
})

export const CommentMutation = extendType({
  type: "Mutation",
  definition(t) {
    /**
     * @dev The process to comment on a publish.
     * @param input see CreateCommentOnPublishInput
     */
    t.field("commentOnPublish", {
      type: nonNull("WriteResult"),
      args: { input: nonNull("CreateCommentInput") },
      async resolve(_root, { input }, { dataSources, idToken }) {
        try {
          // User must logged in.
          if (!idToken) throw new AuthenticationError(authErrMessage)

          // Validation.
          if (!input) throw new UserInputError(badRequestErrMessage)
          const { parentId, creatorId, contentURI, text } = input
          if (
            !parentId ||
            typeof parentId !== "number" ||
            !creatorId ||
            typeof creatorId !== "number" ||
            !contentURI ||
            !text
          )
            throw new UserInputError(badRequestErrMessage)

          // Call the api.
          return dataSources.kmsAPI.commentOnPublish(input)
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * @dev The process to comment on a comment.
     * @param input see CreateCommentOnCommentInput
     */
    t.field("commentOnComment", {
      type: nonNull("WriteResult"),
      args: { input: nonNull("CreateCommentInput") },
      async resolve(_root, { input }, { dataSources, idToken }) {
        try {
          // User must logged in.
          if (!idToken) throw new AuthenticationError(authErrMessage)

          // Validation.
          if (!input) throw new UserInputError(badRequestErrMessage)
          const { parentId, creatorId, contentURI, text } = input
          if (
            !parentId ||
            typeof parentId !== "number" ||
            !creatorId ||
            typeof creatorId !== "number" ||
            !contentURI ||
            !text
          )
            throw new UserInputError(badRequestErrMessage)

          // Call the api.
          return dataSources.kmsAPI.commentOnComment(input)
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * @dev The process to update comment nft
     * @param input see UpdateCommentInput
     */
    t.field("updateComment", {
      type: nonNull("WriteResult"),
      args: { input: nonNull("UpdateCommentInput") },
      async resolve(_root, { input }, { dataSources, idToken }) {
        try {
          // User must logged in.
          if (!idToken) throw new AuthenticationError(authErrMessage)

          // Validation.
          if (!input) throw new UserInputError(badRequestErrMessage)
          const { tokenId, creatorId, contentURI, text } = input
          if (
            !tokenId ||
            typeof tokenId !== "number" ||
            !creatorId ||
            typeof creatorId !== "number" ||
            !contentURI ||
            !text
          )
            throw new UserInputError(badRequestErrMessage)

          // Call the api.
          return dataSources.kmsAPI.updateComment(input)
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * @dev The process to delete comment nft
     */
    t.field("deleteComment", {
      type: nonNull("WriteResult"),
      args: { commentId: nonNull("Int"), creatorId: nonNull("Int") },
      async resolve(_root, { commentId, creatorId }, { dataSources, idToken }) {
        try {
          // User must logged in.
          if (!idToken) throw new AuthenticationError(authErrMessage)

          // Validation.
          if (
            !commentId ||
            typeof commentId !== "number" ||
            !creatorId ||
            typeof creatorId !== "number"
          )
            throw new UserInputError(badRequestErrMessage)

          // Call the api.
          return dataSources.kmsAPI.deleteComment(commentId, creatorId)
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * @dev The process to like a comment
     */
    t.field("likeComment", {
      type: nonNull("WriteResult"),
      args: { commentId: nonNull("Int"), profileId: nonNull("Int") },
      async resolve(_root, { commentId, profileId }, { dataSources, idToken }) {
        try {
          // User must logged in.
          if (!idToken) throw new AuthenticationError(authErrMessage)

          // Validation.
          if (
            !commentId ||
            typeof commentId !== "number" ||
            !profileId ||
            typeof profileId !== "number"
          )
            throw new UserInputError(badRequestErrMessage)

          // Call the api.
          return dataSources.kmsAPI.likeComment(commentId, profileId)
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * @dev The process to dis-like a comment
     */
    t.field("disLikeComment", {
      type: nonNull("WriteResult"),
      args: { commentId: nonNull("Int"), profileId: nonNull("Int") },
      async resolve(_root, { commentId, profileId }, { dataSources, idToken }) {
        try {
          // User must logged in.
          if (!idToken) throw new AuthenticationError(authErrMessage)

          // Validation.
          if (
            !commentId ||
            typeof commentId !== "number" ||
            !profileId ||
            typeof profileId !== "number"
          )
            throw new UserInputError(badRequestErrMessage)

          // Call the api.
          return dataSources.kmsAPI.disLikeComment(commentId, profileId)
        } catch (error) {
          throw error
        }
      },
    })
  },
})
