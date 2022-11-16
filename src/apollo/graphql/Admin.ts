import { extendType, nonNull } from "nexus"
import { UserInputError } from "apollo-server-express"

const badRequestErrMessage = "Bad Request"

// export const AdmidQuery = extendType({
//   type: "Query",
//   definition(t) {
//     t.field("getContractOwnerAddress", {
//       type: nonNull("String"),
//       async resolve(_root, _args, { dataSources }) {
//         try {
//           const { address } = await dataSources.kmsAPI.getOwnerAddress()

//           return address
//         } catch (error) {
//           throw error
//         }
//       },
//     })

//     t.field("getContractBalance", {
//       type: nonNull("Float"),
//       async resolve(_root, _args, { dataSources }) {
//         try {
//           const { balance } = await dataSources.kmsAPI.getContactBalance()

//           return balance
//         } catch (error) {
//           throw error
//         }
//       },
//     })
//   },
// })

export const AdminMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.field("setOwnerAddress", {
      type: nonNull("WriteResult"),
      args: { ownerAddress: nonNull("String") },
      async resolve(_roote, { ownerAddress }, { dataSources }) {
        try {
          if (!ownerAddress) throw new UserInputError(badRequestErrMessage)
          return dataSources.kmsAPI.setOwnerAddress(ownerAddress)
        } catch (error) {
          throw error
        }
      },
    })

    t.field("setProfileContract", {
      type: nonNull("WriteResult"),
      args: { contractAddress: nonNull("String") },
      async resolve(_roote, { contractAddress }, { dataSources }) {
        try {
          if (!contractAddress) throw new UserInputError(badRequestErrMessage)
          return dataSources.kmsAPI.setProfileAddress(contractAddress)
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
      args: { fee: nonNull("Float") },
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
  },
})
