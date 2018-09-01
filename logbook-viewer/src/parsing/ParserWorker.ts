import { BetterDataProvider, SaltedRosetta, SKDelta } from "@aldis/strongly-signalk";

const ctx: Worker = self as any;

ctx.onmessage = ({data}) => {
  if (data.command === 'parseFile' && data.file !== undefined) {
    parseAndAnalyze(SaltedRosetta.fromFile(data.file))
  }
  else if (data.command === 'parseURL' && data.url !== undefined) {
    const p = fetch(data.url).then(response => SaltedRosetta.fromResponse(response))
    parseAndAnalyze(p)
  }
  else {
    ctx.postMessage({error: 'Invalid worker command'})
  }
}

function parseAndAnalyze(p:Promise<SKDelta[]>) {
  performance.mark('parsing-start')
  p.then((deltas: SKDelta[]) => {
    if (deltas.length > 0) {
      if (deltas.length > 1) {
        console.warn(`Data contains ${deltas.length} deltas. Loading first delta from file. Ignoring the rest.`)
      }
      return deltas[0]
    }
    throw new Error('No delta found in file.')
  })
  .then(delta => {
    performance.mark('parsing-end')
    const dataProvider = new BetterDataProvider(delta)
    performance.mark('analysis-end')

    ctx.postMessage({ delta, dataProvider })

    performance.mark('transfer-end')

    performance.measure('Worker: Parsing', 'parsing-start', 'parsing-end')
    performance.measure('Worker: Analysis', 'parsing-end', 'analysis-end')
    performance.measure('Worker: Transfer', 'analysis-end', 'transfer-end')
  })
  .catch(e => {
    ctx.postMessage({error: e})
  })
}
