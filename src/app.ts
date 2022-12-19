import path from "path"
import dotenv from "dotenv"
dotenv.config({ path: path.join(__dirname, "../.env") })
import express from "express"
import cors from "cors"
import http from "http"
import { ApolloServer } from "@apollo/server"
import { expressMiddleware } from "@apollo/server/express4"
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer"
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default"

import { schema } from "./apollo/schema"
import { KmsAPI } from "./apollo/datasources/kms-api"
import { WebhooksAPI } from "./apollo/datasources/webhooks-api"
import { router } from "./webhooks/router"
import { restRouter } from "./rest/router"
import type { Environment } from "./types"
import type { Context } from "./apollo/context"

const { PORT, NODE_ENV } = process.env
const env = NODE_ENV as Environment

async function startServer() {
  const app = express()
  app.use(
    express.json({
      // Add raw body to the req for use in Alchemy webhooks route
      verify: (req, res, buf) => {
        req.rawBody = buf.toString("utf-8")
      },
    })
  ) // for parsing application/json
  app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
  app.use(cors<cors.CorsRequest>())

  // Rest APIs route
  app.use("/api", restRouter)

  // Webhooks route for listening to activity occurred to user's blockchain address
  app.use("/webhooks", router)

  const httpServer = http.createServer(app)

  // Set up ApolloServer.
  const server = new ApolloServer<Context>({
    schema,
    csrfPrevention: true,
    cache: "bounded",
    plugins: [
      // Proper shutdown for the HTTP server.
      ApolloServerPluginDrainHttpServer({ httpServer }),
      ApolloServerPluginLandingPageLocalDefault({ embed: true }),
    ],
    introspection: env !== "production", // Only in development and staging env.
  })

  await server.start()
  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req }) => {
        const { cache } = server
        // Get the user token from the headers.
        const headers = req.headers["authorization"]
        const idToken = headers?.split(" ")[1]

        return {
          idToken,
          dataSources: {
            kmsAPI: new KmsAPI({ idToken, cache }),
            webhooksApi: new WebhooksAPI({ cache }),
          },
        }
      },
    })
  )

  await new Promise<void>((resolver) => {
    httpServer.listen({ port: Number(PORT) }, resolver)
  })

  console.log(`Server ready at port: ${PORT}`)

  return { server, app }
}

startServer()
