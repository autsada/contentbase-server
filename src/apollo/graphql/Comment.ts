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
 * The object containing required data to create a comment.
 * @param targetId {number} - a token id to be commented on (it's a publish or comment token)
 * @param creatorId {number} - a token id of the creator's profile
 * @param contentURI {string} - a publish's content uri
 */
export const CreateCommentInput = inputObjectType({
  name: "CreateCommentInput",
  definition(t) {
    t.nonNull.int("targetId")
    t.nonNull.int("creatorId")
    t.nonNull.string("contentURI")
  },
})

/**",
 * The object containing required data to create a comment.
 * @param tokenId {number} - a token id to be updated
 * @param creatorId {number} - a token id of the creator's profile
 * @param contentURI {string} - a publish's content uri
 */
export const UpdateCommentInput = inputObjectType({
  name: "UpdateCommentInput",
  definition(t) {
    t.nonNull.int("tokenId")
    t.nonNull.int("creatorId")
    t.nonNull.string("contentURI")
  },
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
    t.nonNull.int("targetId")
    t.nonNull.int("likes")
    t.nonNull.int("disLikes")
    t.nonNull.string("contentURI")
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
  },
})

export const CommentMutation = extendType({
  type: "Mutation",
  definition(t) {
    /**
     * @dev The process to create comment nft
     * @param input see CreateCommentInput
     */
    t.field("createComment", {
      type: nonNull("WriteResult"),
      args: { input: nonNull("CreateCommentInput") },
      async resolve(_root, { input }, { dataSources, user }) {
        try {
          // User must logged in.
          if (!user) throw new AuthenticationError(authErrMessage)
          const uid = user.uid

          // Validation.
          if (!uid) throw new ForbiddenError(forbiddenErrMessage)
          if (!input) throw new UserInputError(badRequestErrMessage)
          const { targetId, creatorId, contentURI } = input
          if (
            !targetId ||
            typeof targetId !== "number" ||
            !creatorId ||
            typeof creatorId !== "number" ||
            !contentURI
          )
            throw new UserInputError(badRequestErrMessage)

          // Call the api.
          return dataSources.kmsAPI.createComment(uid, input)
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
      async resolve(_root, { input }, { dataSources, user }) {
        try {
          // User must logged in.
          if (!user) throw new AuthenticationError(authErrMessage)
          const uid = user.uid

          // Validation.
          if (!uid) throw new ForbiddenError(forbiddenErrMessage)
          if (!input) throw new UserInputError(badRequestErrMessage)
          const { tokenId, creatorId, contentURI } = input
          if (
            !tokenId ||
            typeof tokenId !== "number" ||
            !creatorId ||
            typeof creatorId !== "number" ||
            !contentURI
          )
            throw new UserInputError(badRequestErrMessage)

          // Call the api.
          return dataSources.kmsAPI.updateComment(uid, input)
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
      async resolve(_root, { commentId, creatorId }, { dataSources, user }) {
        try {
          // User must logged in.
          if (!user) throw new AuthenticationError(authErrMessage)
          const uid = user.uid

          // Validation.
          if (!uid) throw new ForbiddenError(forbiddenErrMessage)
          if (
            !commentId ||
            typeof commentId !== "number" ||
            !creatorId ||
            typeof creatorId !== "number"
          )
            throw new UserInputError(badRequestErrMessage)

          // Call the api.
          return dataSources.kmsAPI.deleteComment(uid, commentId, creatorId)
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
      async resolve(_root, { commentId, profileId }, { dataSources, user }) {
        try {
          // User must logged in.
          if (!user) throw new AuthenticationError(authErrMessage)
          const uid = user.uid

          // Validation.
          if (!uid) throw new ForbiddenError(forbiddenErrMessage)
          if (
            !commentId ||
            typeof commentId !== "number" ||
            !profileId ||
            typeof profileId !== "number"
          )
            throw new UserInputError(badRequestErrMessage)

          // Call the api.
          return dataSources.kmsAPI.likeComment(uid, commentId, profileId)
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
      async resolve(_root, { commentId, profileId }, { dataSources, user }) {
        try {
          // User must logged in.
          if (!user) throw new AuthenticationError(authErrMessage)
          const uid = user.uid

          // Validation.
          if (!uid) throw new ForbiddenError(forbiddenErrMessage)
          if (
            !commentId ||
            typeof commentId !== "number" ||
            !profileId ||
            typeof profileId !== "number"
          )
            throw new UserInputError(badRequestErrMessage)

          // Call the api.
          return dataSources.kmsAPI.disLikeComment(uid, commentId, profileId)
        } catch (error) {
          throw error
        }
      },
    })
  },
})
