import { BetterDataProvider, SaltedRosetta, SKDelta } from "@aldis/strongly-signalk";

const ctx: Worker = self as any;

ctx.onmessage = ({data}) => {
  if (data.command === 'parseFile' && data.file !== undefined) {
    parseFile(data.file)
  }
  else {
    ctx.postMessage({error: 'Invalid worker command'})
  }
}

function parseFile(f:File) {
  performance.mark('parsing-start')
  SaltedRosetta.fromFile(f)
  .then((deltas: SKDelta[]) => {
    if (deltas.length > 0) {
      if (deltas.length > 1) {
        console.warn(`File ${f.name} contains ${deltas.length} deltas. Loading first delta from file. Ignoring the rest.`)
      }
      return deltas[0]
    }
    throw new Error('No delta found in file.')
  })
  .then(delta => {
    performance.mark('parsing-end')
    const dataProvider = new BetterDataProvider(delta)
    performance.mark('analysis-end')

    ctx.postMessage({ filename: f.name, delta, dataProvider })

    performance.mark('transfer-end')

    performance.measure('Worker: Parsing', 'parsing-start', 'parsing-end')
    performance.measure('Worker: Analysis', 'parsing-end', 'analysis-end')
    performance.measure('Worker: Transfer', 'analysis-end', 'transfer-end')
  })
  .catch(e => {
    ctx.postMessage({error: e})
  })
}
