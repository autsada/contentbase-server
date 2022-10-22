import {
  enumType,
  objectType,
  inputObjectType,
  extendType,
  nonNull,
  list,
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
 * Returned type of CreatePublishNft mutation.
 * @dev see PublishToken.
 * @dev use this type for the returned type of other mutations that return Publish token as well.
 */
export const CreatePublishResult = objectType({
  name: "CreatePublishResult",
  definition(t) {
    t.nonNull.int("tokenId")
    t.nonNull.string("owner")
    t.nonNull.int("creatorId")
    t.nonNull.int("likes")
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
 * @param publishId {number} - a token id of the publish to be updated
 * @param creatorId {number} - a profile token id that owns the publish
 * @param imageURI {string} - a publish's thumbnail image uri
 * @param contentURI {string} - a publish's content uri
 * @param metadataURI {string} - a publish's metadata file uri
 * @param primaryCategory {enum} - a primary category of a publish
 * @param secondaryCategory {enum} - a secondary category of a publish
 * @param tertiaryCategory {enum} - a tertiary category of a publish
 */
export const UpdatePublishInput = inputObjectType({
  name: "UpdatePublishInput",
  definition(t) {
    t.nonNull.int("publishId")
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
 * Return type for delete NFT
 */
export const BurnNFTResult = objectType({
  name: "BurnNFTResult",
  definition(t) {
    t.nonNull.int("status")
  },
})

/**
 * Returned type of publish queries.
 * @dev see PublishToken.
 * @dev use this type for the returned type for all publish quiries.
 */
export const FetchPublishResult = objectType({
  name: "FetchPublishResult",
  definition(t) {
    t.nonNull.int("tokenId")
    t.nonNull.string("owner")
    t.nonNull.int("creatorId")
    t.nonNull.int("likes")
    t.nonNull.string("imageURI")
    t.nonNull.string("contentURI")
    t.nonNull.string("metadataURI")
  },
})

/**
 * Publish Token Type
 * @dev this is the object type for data that will be stored in Firestore.
 * @param id {string} - Firestore document id
 * @param uid {string} - a user auth uid
 * @param tokenId {number} - a Publish token id
 * @param owner {string} - a blockchain address that owns the token
 * @param creatorId {number} - a Profile token id that owns the token
 * @param likes {number} - number of likes
 * @param imageURI {string} - a publish's thumbnail image uri
 * @param contentURI {string} - a publish's content uri
 * @param metadataURI {string} - a publish's metadata file uri
 * @param title {string} - a publish's title
 * @param description {string} - a publish's description
 * @param primaryCategory {enum} - a primary category of a publish
 * @param secondaryCategory {enum} - a secondary category of a publish
 * @param tertiaryCategory {enum} - a tertiary category of a publish
 * @param createdAt {string}
 * @param updatedAt {string}
 */
export const PublishToken = objectType({
  name: "PublishToken",
  definition(t) {
    t.nonNull.string("id")
    t.nonNull.string("uid")
    t.nonNull.int("tokenId")
    t.nonNull.string("owner")
    t.nonNull.int("creatorId")
    t.nonNull.int("likes")
    t.nonNull.string("imageURI")
    t.nonNull.string("contentURI")
    t.nonNull.string("metadataURI")
    t.nonNull.string("title")
    t.nonNull.string("description")
    t.nonNull.field("primaryCategory", { type: nonNull("Category") })
    t.nonNull.field("secondaryCategory", { type: nonNull("Category") })
    t.nonNull.field("tertiaryCategory", { type: nonNull("Category") })
    t.nonNull.string("createdAt")
    t.string("updatedAt")
  },
})

export const PublishQuery = extendType({
  type: "Query",
  definition(t) {
    /**
     * @dev Get user's publishes by provided ids.
     * @dev This query is for testing in development only.
     */
    t.field("getMyPublishes", {
      type: nonNull(list("FetchPublishResult")),
      async resolve(_root, _args, { dataSources, user }) {
        try {
          if (!user) throw new AuthenticationError(authErrMessage)
          const uid = user.uid

          // Validate input
          if (!uid) throw new ForbiddenError(forbiddenErrMessage)

          // TODO: Get user's profile ids from Firestore
          const { tokens } = await dataSources.kmsAPI.getMyPublishes(
            uid,
            [1, 2, 3, 4, 5, 6, 7]
          )

          return tokens
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * @dev Get publishes
     */
    t.field("getPublishes", {
      type: nonNull(list("FetchPublishResult")),
      async resolve(_root, _args, { dataSources, user }) {
        try {
          const { tokens } = await dataSources.kmsAPI.getPublishes([
            1, 2, 3, 4, 5, 6, 7,
          ])

          return tokens
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * @dev Get one publish
     */
    t.field("getPublish", {
      type: nonNull("FetchPublishResult"),
      args: { publishId: nonNull("Int") },
      async resolve(_root, { publishId }, { dataSources }) {
        try {
          if (typeof publishId !== "number")
            throw new UserInputError(badRequestErrMessage)

          const { token } = await dataSources.kmsAPI.getPublish(publishId)

          return token
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * @dev Get total publishes
     */
    t.field("totalPublishes", {
      type: nonNull("Int"),
      async resolve(_root, _args, { dataSources }) {
        try {
          const { total } = await dataSources.kmsAPI.totalPublishes()

          return total
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
          if (!user) throw new AuthenticationError(authErrMessage)
          const uid = user.uid

          if (!uid) throw new ForbiddenError(forbiddenErrMessage)

          // Validate input.
          if (!data) throw new UserInputError(badRequestErrMessage)
          const { role } = data

          if (!role) throw new UserInputError(badRequestErrMessage)

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
    t.field("createPublishNft", {
      type: nonNull("CreatePublishResult"),
      args: { input: nonNull("CreatePublishInput") },
      async resolve(_root, { input }, { dataSources, user }) {
        try {
          // User must be already logged in
          if (!user) throw new AuthenticationError(authErrMessage)
          const uid = user.uid

          if (!uid) throw new ForbiddenError(forbiddenErrMessage)

          // Validate input.
          if (!input) throw new UserInputError(badRequestErrMessage)
          const {
            creatorId,
            imageURI,
            contentURI,
            metadataURI,
            title,
            description,
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

          // Create a profile
          const { token } = await dataSources.kmsAPI.createPublishNft(uid, {
            creatorId,
            imageURI,
            contentURI,
            metadataURI,
            title,
            description,
            primaryCategory,
            secondaryCategory,
            tertiaryCategory,
          })

          if (!token) throw new Error("Create publish nft failed.")

          // Save new token in Firestore (publishes collection)
          await dataSources.firestoreAPI.createPublishDoc({
            ...token,
            uid,
          })

          return token
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * @dev The process to update publish nft
     * @param input - see UpdatePublishInput
     */
    t.field("updatePublishNft", {
      type: nonNull("CreatePublishResult"),
      args: { input: nonNull("UpdatePublishInput") },
      async resolve(_root, { input }, { dataSources, user }) {
        try {
          // User must be already logged in
          if (!user) throw new AuthenticationError(authErrMessage)
          const uid = user.uid

          if (!uid) throw new ForbiddenError(forbiddenErrMessage)

          // Validate input.
          if (!input) throw new UserInputError(badRequestErrMessage)
          const {
            publishId,
            creatorId,
            imageURI,
            contentURI,
            metadataURI,
            title,
            description,
            primaryCategory,
            secondaryCategory,
            tertiaryCategory,
          } = input

          // description can be empty string.
          if (
            typeof publishId !== "number" ||
            !publishId ||
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

          // Update
          const { token } = await dataSources.kmsAPI.updatePublishNft(uid, {
            publishId,
            creatorId,
            imageURI,
            contentURI,
            metadataURI,
            title,
            description,
            primaryCategory,
            secondaryCategory,
            tertiaryCategory,
          })

          if (!token) throw new Error("Update publish nft failed.")

          // Update the publish doc in Firestore.
          // Search the publish doc by token id to get the document id first.
          const { publish } =
            await dataSources.firestoreAPI.searchPublishByTokenId(publishId)

          if (publish) {
            // Only update if there is any change.
            if (
              token.imageURI !== publish.imageURI ||
              token.contentURI !== publish.contentURI ||
              token.metadataURI !== publish.metadataURI ||
              token.title !== publish.title ||
              token.description !== publish.description ||
              token.primaryCategory !== publish.primaryCategory ||
              token.secondaryCategory !== publish.secondaryCategory ||
              token.tertiaryCategory !== publish.tertiaryCategory
            ) {
              await dataSources.firestoreAPI.updatePublishDoc(publish.id, {
                ...token,
                primaryCategory: token.primaryCategory,
                // If secondary is "Empty" and tertiary is not, then use the tertiary as secondary and make tertiary "Empty".
                secondaryCategory:
                  token.secondaryCategory === "Empty" &&
                  token.tertiaryCategory !== "Empty"
                    ? token.tertiaryCategory
                    : token.secondaryCategory,
                tertiaryCategory:
                  token.secondaryCategory === "Empty" &&
                  token.tertiaryCategory !== "Empty"
                    ? "Empty"
                    : token.tertiaryCategory,
              })
            }
          }

          return token
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * @dev The process to delete publish nft
     */
    t.field("burnPublishNft", {
      type: nonNull("BurnNFTResult"),
      args: { publishId: nonNull("Int") },
      async resolve(_root, { publishId }, { dataSources, user }) {
        try {
          // User must be already logged in
          if (!user) throw new AuthenticationError(authErrMessage)
          const uid = user.uid

          if (!uid) throw new ForbiddenError(forbiddenErrMessage)

          // Validate input
          if (typeof publishId !== "number" || !publishId)
            throw new UserInputError(badRequestErrMessage)

          const { status } = await dataSources.kmsAPI.burnPublishNft(
            uid,
            publishId
          )

          // Delete the publish doc in Firestore.
          // Search the publish doc by token id to get the document id first.
          const { publish } =
            await dataSources.firestoreAPI.searchPublishByTokenId(publishId)

          if (publish) {
            await dataSources.firestoreAPI.deletePublishDoc(publish.id)
          }

          return { status }
        } catch (error) {
          throw error
        }
      },
    })

    /**
     * @dev Estimate gas used for creating a publish nft.
     * @param input - refer to CreatePublishInput type
     */
    t.field("estimateCreatePublishGas", {
      type: nonNull("EstimateCreateNFTGasResult"),
      args: { input: nonNull("CreatePublishInput") },
      async resolve(_roote, { input }, { dataSources, user }) {
        try {
          // User must be already logged in
          if (!user) throw new AuthenticationError(authErrMessage)
          const uid = user?.uid

          if (!uid) throw new ForbiddenError(forbiddenErrMessage)

          // Validate input.
          if (!input) throw new UserInputError(badRequestErrMessage)
          const {
            creatorId,
            imageURI,
            contentURI,
            metadataURI,
            title,
            description,
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

          // Create a profile
          const { gas } = await dataSources.kmsAPI.estimateCreatePublishGas(
            uid,
            {
              creatorId,
              imageURI,
              contentURI,
              metadataURI,
              title,
              description,
              primaryCategory,
              secondaryCategory,
              tertiaryCategory,
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
