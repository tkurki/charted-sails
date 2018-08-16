declare module '@signalk/nmea0183-utilities' {
  export function transform(v: number, inFormat: string, outFormat: string): number
}

declare module 'signalk__nmea0183-signalk';

declare module '@signalk/nmea0183-signalk' {
  export default class NMEA0183Parser {
    constructor()
    public parse(data:string): any
  }
}

declare module 'canboatjs' {
  export interface FromPgnOptions {
    format: -1|1
  }

  // {"pgn":129026,"timestamp":"1970-01-18T15:57:19.612Z","src":127,"dst":255,"prio":0,
  //  "fields":{"SID":0,"COG Reference":"Magnetic","COG":1.2389,"SOG":0},"description":"COG & SOG, Rapid Update"}
  export class N2kMessage {
    pgn: number
    timestamp: Date
    src: number
    dst: number
    prio: number
    fields: any
    description: string
  }

  export class FromPgn {
    constructor(opts: FromPgnOptions)
    public parse(data: string): void
    public on(event: 'pgn', cb: ( (pgn:N2kMessage) => void )): void
    public on(event: 'error', cb: ( (pgn:any, error: any) => void )): void
  }
}

declare module '@signalk/n2k-signalk' {
  import { N2kMessage } from 'canboatjs'

  export function toDelta(n2k:N2kMessage): any
}

declare module 'jest-matcher-deep-close-to'

declare module 'simplify-path'

// Allows us to load our package.json
declare module "*.json"