import commander from 'commander';
import fetch from 'node-fetch';
import uuidv4 from 'uuid/v4';
import * as pkgInfo from '../../package.json';
import { SignalKTripAnalyzer } from '../analysis/SignalKTripAnalyzer';
import { HistoryBuilder } from '../loader/HistoryBuilder';
import { SaltedRosetta } from '../loader/SaltedRosetta';

let simplify = require('simplify-path')

export async function babelSignalKCLI(args: string[]) {
  commander.version(pkgInfo.version)
  commander.description("Convert any marine logfile to SignalK")
  commander.option("-d --debug", "Be more verbose")
  commander.command("summary <url or file>", undefined, { isDefault: true })
           .description("Print a summary of the log")
           .action(printSummary)
  commander.command("delta <url or file>")
           .description("Print log in SK Delta format")
           .option("-p --pretty-print", "Pretty-print JSON output")
           .action(printDelta)

  commander.command("history <url or file>")
          .description("Print log in SK History format")
          .option("-p --pretty-print", "Pretty-print JSON output")
          .action(printHistory)

  try {
    commander.parse(args)
  }
  catch (e) {
    if (commander.debug) {
      console.error(e)
    }
    console.error(e.message)
    return
  }
}

async function loadFileOrUrl(urlOrFilename:string) {
  if (urlOrFilename.startsWith('http')) {
    return await fetch(urlOrFilename).then(response => {
      return SaltedRosetta.fromResponse(response as unknown as Response)
    })
    .catch(e => {
      if (commander.debug) {
        console.error(e)
      }
      else {
        console.error(e.message)
      }
      return []
    })
  }
  else {
    return SaltedRosetta.fromFilename(urlOrFilename)
  }
}

async function printSummary(urlOrFilename:string) {
  let deltas = await loadFileOrUrl(urlOrFilename)

  deltas.forEach(delta => {
    const countUpdates = delta.updates.length
    const countValues = delta.updates.reduce((count, update) => {
      return count + update.values.length
    }, 0)
    const paths:{[index:string]: boolean} = delta.updates.reduce((paths:any, update) => {
      update.values.forEach(v => { paths[v.path] = true })
      return paths
    }, {})

    const tracePath : [number, number][] = SignalKTripAnalyzer.getPath(delta)
      .map(position => [position.longitude, position.latitude] as [number,number])

    const simplifiedPath = simplify(tracePath, 0.01)

    console.log(`Context: ${delta.context ? delta.context : '<null>'} - ${countUpdates} updates and ${countValues} values`)
    console.log(`Included SignalK paths: ${Object.keys(paths).sort()}`)
    const bounds = SignalKTripAnalyzer.getBounds(delta)
    if (bounds) {
      console.log(`Bounds: ${bounds[0].asArray()} ${bounds[1].asArray()}`)
    }
    if (delta.updates.length > 0) {
      console.log(`Start: ${SignalKTripAnalyzer.getStartTime(delta)!.toISOString()}`)
      console.log(`End: ${SignalKTripAnalyzer.getEndTime(delta)!.toISOString()}`)
    }
    console.log(`Path: ${JSON.stringify(simplifiedPath)}`)
  })
}

async function printHistory(urlOrFilename:string, options:any) {
  const deltas = await loadFileOrUrl(urlOrFilename)
  const historyBuilder = new HistoryBuilder()
  deltas.forEach(delta => {
    // Add a context if needed so we can build a history
    if (!delta.context) {
      delta.context = "vessels.urn:mrn:signalk:uuid:" + uuidv4()
    }
    historyBuilder.addDelta(delta)
  })
  if (options.pretty_print) {
    console.log(JSON.stringify(historyBuilder.retrieve(), null, 2))
  }
  else {
    console.log(JSON.stringify(historyBuilder.retrieve()))
  }
}

async function printDelta(urlOrFilename:string, options:any) {
  const deltas = await loadFileOrUrl(urlOrFilename)
  deltas.forEach(delta => {
    if (options.pretty_print) {
      console.log(JSON.stringify(delta, null, 2))
    }
    else {
      console.log(JSON.stringify(delta))
    }
  })
}

if (require.main === module) {
  babelSignalKCLI(process.argv)
}
