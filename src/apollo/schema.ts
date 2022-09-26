import path from 'path'
import { makeSchema } from 'nexus'

import * as types from './graphql'

const { NODE_ENV } = process.env

export const schema = makeSchema({
  types,
  outputs: {
    typegen: path.join(process.cwd(), 'src/apollo/typegen.ts'),
    schema: path.join(process.cwd(), 'src/apollo/schema.graphql'),
  },
  contextType: {
    module: path.join(
      process.cwd(),
      NODE_ENV === 'production' || NODE_ENV === 'staging'
        ? 'apollo/context.js'
        : 'src/apollo/context.ts'
    ),
    export: 'Context',
  },
})
