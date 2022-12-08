import { expect } from 'aegir/chai'
import { isNode, isElectronMain } from 'wherearewe'
import * as WS from '../src/index.js'

describe('address', () => {
  if (!(isNode || isElectronMain)) {
    return
  }

  it('server .address should return bound address', async () => {
    const server = WS.createServer()
    await server.listen(55214)
    expect(server.address).to.be.a('function')
    expect(server.address()).to.have.property('port', 55214, 'return address should match')
    await server.close()
  })

  it('server listen error should be catchable', async () => {
    const server1 = WS.createServer()
    await server1.listen(55215)
    const server2 = WS.createServer()
    await expect(server2.listen(55215)).to.be.eventually.rejectedWith('listen EADDRINUSE')
    await server1.close()
  })
})
