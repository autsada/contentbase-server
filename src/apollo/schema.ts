import path from 'path'
import { makeSchema } from 'nexus'

import * as types from './graphql'

export const schema = makeSchema({
  types,
  outputs: {
    typegen: path.join(process.cwd(), 'src/apollo/typegen.ts'),
    schema: path.join(process.cwd(), 'src/apollo/schema.graphql'),
  },
  contextType: {
    module: path.join(process.cwd(), 'src/types/context.ts'),
    export: 'Context',
  },
})
