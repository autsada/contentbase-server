import path from 'path'
import { makeSchema } from 'nexus'

import * as types from './graphql'

export const schema = makeSchema({
  types,
  outputs: {
    typegen: path.join(__dirname, '.', 'typegen.ts'),
    schema: path.join(__dirname, '.', 'schema.graphql'),
  },
  contextType: {
    module: path.join(__dirname, '../types', 'context.ts'),
    export: 'Context',
  },
})
