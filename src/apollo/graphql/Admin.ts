import { extendType, nonNull } from "nexus"
import { UserInputError } from "apollo-server-express"

const badRequestErrMessage = "Bad Request"

export const AdmidQuery = extendType({
  type: "Query",
  definition(t) {
    t.field("getContractOwnerAddress", {
      type: nonNull("String"),
      async resolve(_root, _args, { dataSources }) {
        try {
          const { address } = await dataSources.kmsAPI.getOwnerAddress()

          return address
        } catch (error) {
          throw error
        }
      },
    })

    t.field("getContractBalance", {
      type: nonNull("Float"),
      async resolve(_root, _args, { dataSources }) {
        try {
          const { balance } = await dataSources.kmsAPI.getContactBalance()

          return balance
        } catch (error) {
          throw error
        }
      },
    })
  },
})

export const AdminMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.field("setFollowContractForProfile", {
      type: nonNull("String"),
      args: { followContractAddress: nonNull("String") },
      async resolve(_roote, { followContractAddress }, { dataSources, user }) {
        try {
          if (!followContractAddress)
            throw new UserInputError(badRequestErrMessage)

          const { status } = await dataSources.kmsAPI.setFollowForProfile(
            followContractAddress
          )

          return status
        } catch (error) {
          throw error
        }
      },
    })

    t.field("setProfileContractForPublish", {
      type: nonNull("String"),
      args: { profileContractAddress: nonNull("String") },
      async resolve(_roote, { profileContractAddress }, { dataSources, user }) {
        try {
          if (!profileContractAddress)
            throw new UserInputError(badRequestErrMessage)

          const { status } = await dataSources.kmsAPI.setProfileForPublish(
            profileContractAddress
          )

          return status
        } catch (error) {
          throw error
        }
      },
    })

    t.field("setLikeContractForPublish", {
      type: nonNull("String"),
      args: { likeContractAddress: nonNull("String") },
      async resolve(_roote, { likeContractAddress }, { dataSources, user }) {
        try {
          if (!likeContractAddress)
            throw new UserInputError(badRequestErrMessage)

          const { status } = await dataSources.kmsAPI.setLikeForPublish(
            likeContractAddress
          )

          return status
        } catch (error) {
          throw error
        }
      },
    })

    t.field("setProfileContractForFollow", {
      type: nonNull("String"),
      args: { profileContractAddress: nonNull("String") },
      async resolve(_roote, { profileContractAddress }, { dataSources, user }) {
        try {
          if (!profileContractAddress)
            throw new UserInputError(badRequestErrMessage)

          const { status } = await dataSources.kmsAPI.setProfileForFollow(
            profileContractAddress
          )

          return status
        } catch (error) {
          throw error
        }
      },
    })

    t.field("setProfileContractForLike", {
      type: nonNull("String"),
      args: { profileContractAddress: nonNull("String") },
      async resolve(_roote, { profileContractAddress }, { dataSources, user }) {
        try {
          if (!profileContractAddress)
            throw new UserInputError(badRequestErrMessage)

          const { status } = await dataSources.kmsAPI.setProfileForLike(
            profileContractAddress
          )

          return status
        } catch (error) {
          throw error
        }
      },
    })

    t.field("setPublishContractForLike", {
      type: nonNull("String"),
      args: { publishContractAddress: nonNull("String") },
      async resolve(_roote, { publishContractAddress }, { dataSources, user }) {
        try {
          if (!publishContractAddress)
            throw new UserInputError(badRequestErrMessage)

          const { status } = await dataSources.kmsAPI.setPublishForLike(
            publishContractAddress
          )

          return status
        } catch (error) {
          throw error
        }
      },
    })

    t.field("setOwnerAddress", {
      type: nonNull("String"),
      args: { ownerAddress: nonNull("String") },
      async resolve(_roote, { ownerAddress }, { dataSources, user }) {
        try {
          if (!ownerAddress) throw new UserInputError(badRequestErrMessage)

          const { status } = await dataSources.kmsAPI.setContractOwnerAddress(
            ownerAddress
          )

          return status
        } catch (error) {
          throw error
        }
      },
    })

    t.field("withdrawFunds", {
      type: nonNull("String"),
      async resolve(_roote, _args, { dataSources, user }) {
        try {
          const { status } = await dataSources.kmsAPI.withdrawFunds()

          return status
        } catch (error) {
          throw error
        }
      },
    })

    t.field("setLikeFee", {
      type: nonNull("String"),
      args: { fee: nonNull("Float") },
      async resolve(_roote, { fee }, { dataSources, user }) {
        try {
          if (!fee || typeof fee !== "number") throw new Error("Bad input")

          const { status } = await dataSources.kmsAPI.setLikeFee(fee)

          return status
        } catch (error) {
          throw error
        }
      },
    })

    t.field("setPlatformFee", {
      type: nonNull("String"),
      args: { fee: nonNull("Float") },
      async resolve(_roote, { fee }, { dataSources, user }) {
        try {
          if (!fee || typeof fee !== "number") throw new Error("Bad input")

          const { status } = await dataSources.kmsAPI.setPlatformFee(fee)

          return status
        } catch (error) {
          throw error
        }
      },
    })
  },
})
