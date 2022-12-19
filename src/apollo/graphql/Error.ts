import { GraphQLError } from "graphql"

export type ErrorCode = "BAD_USER_INPUT" | "UNAUTHENTICATED" | "FORBIDDEN"

export const authErrMessage = "*** You must be logged in ***"
export const badInputErrMessage = "*** Bad Input Error ***"

export function throwError(message: string, code: ErrorCode) {
  throw new GraphQLError(message, {
    extensions: {
      code,
    },
  })
}
