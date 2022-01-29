'use strict'

/** @type {import('aegir').PartialOptions} */
module.exports = {
  test: {
    async before () {
      const { createTestServer } = await import('./dist/test/helpers/server.js')

      return {
        server: createTestServer()
      }
    },
    async after (_, before) {
      if (before.server) {
        before.server.close()
      }
    }
  }
}
