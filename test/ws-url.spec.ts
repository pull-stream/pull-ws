import { expect } from 'aegir/chai'
import wsurl from '../src/ws-url.js'

describe('ws-url', () => {
  it('map from a relative url to one for this domain', () => {
    const location = {
      protocol: 'http',
      host: 'foo.com',
      pathname: '/whatever',
      search: '?okay=true'
    }

    expect(wsurl('//bar.com', location)).to.equal('ws://bar.com/')
    expect(wsurl('/this', location)).to.equal('ws://foo.com/this')
  })

  it('same path works on dev and deployed', () => {
    expect(wsurl('/', {
      protocol: 'http',
      host: 'localhost:8000'
    })).to.equal('ws://localhost:8000/')
    expect(wsurl('/', {
      protocol: 'http',
      host: 'server.com:8000'
    })).to.equal('ws://server.com:8000/')
  })

  it('universal url still works', () => {
    expect(wsurl('ws://what.com/okay', {
      protocol: 'http',
      host: 'localhost:8000'
    })).to.equal('ws://what.com/okay')
    expect(wsurl('wss://localhost/', {
      protocol: 'https',
      host: 'localhost:8000'
    })).to.equal('wss://localhost/')
  })
})
