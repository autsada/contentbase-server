import { extendType, nonNull } from "nexus"

import { badInputErrMessage, throwError } from "./Error"

export const AdminMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.field("setProfileForFollow", {
      type: nonNull("WriteResult"),
      args: { contractAddress: nonNull("String") },
      async resolve(_roote, { contractAddress }, { dataSources }) {
        try {
          if (!contractAddress) throwError(badInputErrMessage, "BAD_USER_INPUT")
          return dataSources.kmsAPI.setProfileForFollow(contractAddress)
        } catch (error) {
          throw error
        }
      },
    })

    t.field("setProfileForPublish", {
      type: nonNull("WriteResult"),
      args: { contractAddress: nonNull("String") },
      async resolve(_roote, { contractAddress }, { dataSources }) {
        try {
          if (!contractAddress) throwError(badInputErrMessage, "BAD_USER_INPUT")
          return dataSources.kmsAPI.setProfileForPublish(contractAddress)
        } catch (error) {
          throw error
        }
      },
    })

    t.field("setOwnerAddress", {
      type: nonNull("WriteResult"),
      args: { ownerAddress: nonNull("String") },
      async resolve(_roote, { ownerAddress }, { dataSources }) {
        try {
          if (!ownerAddress) throwError(badInputErrMessage, "BAD_USER_INPUT")
          return dataSources.kmsAPI.setOwner(ownerAddress)
        } catch (error) {
          throw error
        }
      },
    })

    t.field("setProfileForLike", {
      type: nonNull("WriteResult"),
      args: { contractAddress: nonNull("String") },
      async resolve(_roote, { contractAddress }, { dataSources }) {
        try {
          if (!contractAddress) throwError(badInputErrMessage, "BAD_USER_INPUT")
          return dataSources.kmsAPI.setProfileForLike(contractAddress)
        } catch (error) {
          throw error
        }
      },
    })

    t.field("setPublishForLike", {
      type: nonNull("WriteResult"),
      args: { contractAddress: nonNull("String") },
      async resolve(_roote, { contractAddress }, { dataSources }) {
        try {
          if (!contractAddress) throwError(badInputErrMessage, "BAD_USER_INPUT")
          return dataSources.kmsAPI.setPublishForLike(contractAddress)
        } catch (error) {
          throw error
        }
      },
    })

    t.field("setLikeFee", {
      type: nonNull("WriteResult"),
      args: { fee: nonNull("Float") },
      async resolve(_roote, { fee }, { dataSources }) {
        try {
          if (!fee || typeof fee !== "number") throw new Error("Bad input")
          return dataSources.kmsAPI.setLikeFee(fee)
        } catch (error) {
          throw error
        }
      },
    })

    t.field("setPlatformFee", {
      type: nonNull("WriteResult"),
      args: { fee: nonNull("Int") },
      async resolve(_roote, { fee }, { dataSources }) {
        try {
          if (!fee || typeof fee !== "number") throw new Error("Bad input")
          return dataSources.kmsAPI.setPlatformFee(fee)
        } catch (error) {
          throw error
        }
      },
    })

    t.field("withdrawFunds", {
      type: nonNull("WriteResult"),
      async resolve(_roote, _args, { dataSources }) {
        try {
          return dataSources.kmsAPI.withdrawFunds()
        } catch (error) {
          throw error
        }
      },
    })

    t.field("setProfileForComment", {
      type: nonNull("WriteResult"),
      args: { contractAddress: nonNull("String") },
      async resolve(_roote, { contractAddress }, { dataSources }) {
        try {
          if (!contractAddress) throwError(badInputErrMessage, "BAD_USER_INPUT")
          return dataSources.kmsAPI.setProfileForComment(contractAddress)
        } catch (error) {
          throw error
        }
      },
    })

    t.field("setPublishForComment", {
      type: nonNull("WriteResult"),
      args: { contractAddress: nonNull("String") },
      async resolve(_roote, { contractAddress }, { dataSources }) {
        try {
          if (!contractAddress) throwError(badInputErrMessage, "BAD_USER_INPUT")
          return dataSources.kmsAPI.setPublishForComment(contractAddress)
        } catch (error) {
          throw error
        }
      },
    })
  },
})
