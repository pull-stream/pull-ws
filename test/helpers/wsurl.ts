/* eslint-env browser */

// @ts-expect-error no types
import wsurl from 'wsurl'

export default wsurl('http://localhost:3000') as string
