declare module 'deck.gl';

declare module '@signalk/nmea0183-utilities' {
  export function transform(v: number, inFormat: string, outFormat: string): number
}

declare module "worker-loader!*" {
  class WebpackWorker extends Worker {
    constructor();
  }

  export default WebpackWorker;
}