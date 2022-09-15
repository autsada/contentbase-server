import path from 'path'
import dotenv from 'dotenv'
dotenv.config({ path: path.join(__dirname, '../.env') })
import express from 'express'
import cors from 'cors'
import https from 'https'
import http from 'http'
import fs from 'fs'
import { ApolloServer } from 'apollo-server-express'
import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageLocalDefault,
} from 'apollo-server-core'
import { WebSocketServer } from 'ws'
import { useServer } from 'graphql-ws/lib/use/ws'

import './lib/config/firebase' // import firebase config to initialize firebase admin
import { schema } from './apollo/schema'
import { BlockchainAPI } from './apollo/datasources/blockchain-api'
import { FirestoreAPI } from './apollo/datasources/firestore-api'
import { WebhooksAPI } from './apollo/datasources/webhooks-api'
import { db } from './lib/config/firebase'
import { router } from './webhooks/router'
import { webSocket } from './webhooks/socketIO'
import { getUserFromAuthorizationHeader } from './lib/utils/helpers'
import type { Environment, EnvConfig } from './types'

const { DEV_PORT, PROD_PORT, NODE_ENV } = process.env

async function startServer() {
  const configurations: Record<Environment, EnvConfig> = {
    production: { ssl: true, port: Number(PROD_PORT) || 443, hostname: '' },
    development: {
      ssl: false,
      port: Number(DEV_PORT) || 4000,
      hostname: 'localhost',
    },
  }

  const environment = (NODE_ENV || 'production') as Environment
  const config: EnvConfig = configurations[environment]

  const app = express()
  app.use(
    express.json({
      // Add raw body to the req for use in Alchemy webhooks route
      verify: (req, res, buf) => {
        req.rawBody = buf.toString('utf-8')
      },
    })
  ) // for parsing application/json
  app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
  app.use(cors())

  // Webhooks route for listening to activity occurred to user's blockchain address
  app.use('/webhooks', router)

  // Create the HTTPS or HTTP server, per configuration
  let httpServer: https.Server | http.Server
  if (config.ssl) {
    // Assumes certificates are in a .ssl folder off of the package root.
    // Make sure these files are secured.
    httpServer = https.createServer(
      {
        key: fs.readFileSync(
          path.join(__dirname, `../.ssl/${environment}/server.key`)
        ),
        cert: fs.readFileSync(
          path.join(__dirname, `../.ssl/${environment}/server.crt`)
        ),
      },

      app
    )
  } else {
    httpServer = http.createServer(app)
  }

  // Create our WebSocket server using the HTTP server we just set up.
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  })

  // Save the returned server's info so we can shutdown this server later
  const serverCleanup = useServer(
    {
      schema,
      context: async (ctx, msg, args) => {
        const authorizationHeader = ctx.connectionParams?.authorization as
          | string
          | undefined
        const result = await getUserFromAuthorizationHeader(authorizationHeader)

        return result
      },
    },
    wsServer
  )

  // Set up ApolloServer.
  const server = new ApolloServer({
    schema,
    csrfPrevention: true,
    cache: 'bounded',
    plugins: [
      // Proper shutdown for the HTTP server.
      ApolloServerPluginDrainHttpServer({ httpServer }),
      // Proper shutdown for the WebSocket server.
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose()
            },
          }
        },
      },
      ApolloServerPluginLandingPageLocalDefault({ embed: true }),
    ],
    dataSources: () => ({
      firestoreAPI: new FirestoreAPI({ db }),
      blockchainAPI: new BlockchainAPI(),
      webhooksApi: new WebhooksAPI(),
    }),
    context: async ({ req }) => {
      // Get the user token from the headers.
      const authorizationHeaders = req.headers['authorization']
      const result = await getUserFromAuthorizationHeader(authorizationHeaders)

      return result
    },
  })

  await server.start()
  server.applyMiddleware({ app })

  await new Promise<void>((resolver) => {
    httpServer.listen({ port: config.port }, resolver)
  })

  // const io = webSocket.createIO(httpServer)
  // io.on('connection', (socket) => {
  //   console.log('Client connected: ', socket.id)
  // })

  console.log(
    'Server ready at',
    `http${config.ssl ? 's' : ''}://${config.hostname}:${config.port}${
      server.graphqlPath
    }`
  )

  return { server, app }
}

startServer()
