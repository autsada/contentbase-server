import path from "path"
import dotenv from "dotenv"
dotenv.config({ path: path.join(__dirname, "../.env") })
import express from "express"
import cors from "cors"
import http from "http"
import { ApolloServer } from "apollo-server-express"
import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageLocalDefault,
} from "apollo-server-core"

import { schema } from "./apollo/schema"
import { KmsAPI } from "./apollo/datasources/kms-api"
import { WebhooksAPI } from "./apollo/datasources/webhooks-api"
import { router } from "./webhooks/router"
import { restRouter } from "./rest/router"
import type { Environment } from "./types"

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
  app.use(cors())

  // Rest APIs route
  app.use("/api", restRouter)

  // Webhooks route for listening to activity occurred to user's blockchain address
  app.use("/webhooks", router)

  const httpServer = http.createServer(app)

  // Set up ApolloServer.
  const server = new ApolloServer({
    schema,
    csrfPrevention: true,
    cache: "bounded",
    plugins: [
      // Proper shutdown for the HTTP server.
      ApolloServerPluginDrainHttpServer({ httpServer }),
      ApolloServerPluginLandingPageLocalDefault({ embed: true }),
    ],
    dataSources: () => ({
      kmsAPI: new KmsAPI(),
      webhooksApi: new WebhooksAPI(),
    }),
    context: async ({ req }) => {
      // Get the user token from the headers.
      const headers = req.headers["authorization"]
      const token = headers?.split(" ")[1]
      return { idToken: token }
    },
    introspection: env !== "production", // Only in development and staging env.
  })

  await server.start()
  server.applyMiddleware({ app })

  await new Promise<void>((resolver) => {
    httpServer.listen({ port: Number(PORT) }, resolver)
  })

  console.log(`Server ready at port: ${PORT}`)

  return { server, app }
}

startServer()
