import { relative } from 'iso-url'

const map = { http: 'ws', https: 'wss' }
const def = 'ws'

export default (url: string, location: string | Partial<Location>): string => relative(url, location, map, def)
