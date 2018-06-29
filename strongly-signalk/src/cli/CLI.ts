import * as commander from 'commander'
import * as pkgInfo from '../../package.json'
import { readFileSync } from 'fs';
import { CSVConversionOption, CSVLoader } from '../loader/CSVLoader';
import { ExpeditionFormatConversion } from '../loader/ExpeditionFormatConversion';
import { SignalKTripAnalyzer } from '../analysis/SignalKTripAnalyzer';

let simplify = require('simplify-path')

export function babelSignalKCLI(args: string[]) {
  commander.version(pkgInfo.version)
  commander.usage("[options] <path>")
  commander.description("Convert Expedition logfile to SignalK")
  commander.option("-s --summary", "Print a summary of the log instead of the full SignalK Delta")
  commander.parse(args)

  if (commander.args.length > 0) {
    let options: CSVConversionOption = {
      "sourceLabel": commander.args[0],
      "conversion": new ExpeditionFormatConversion()
    }

    let data = readFileSync(commander.args[0], { 'encoding': 'utf8'})
    let delta = CSVLoader.fromString(data, options)

    if (commander['summary']) {
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

      console.log(`Log contains ${countUpdates} updates and ${countValues} values`)
      console.log(`Included SignalK paths: ${Object.keys(paths).sort()}`)
      const bounds = SignalKTripAnalyzer.getBounds(delta)
      if (bounds) {
        console.log(`Bounds: ${bounds[0].asArray()} ${bounds[1].asArray()}`)
      }
      console.log(`Start: ${SignalKTripAnalyzer.getStartTime(delta)!.toISOString()}`)
      console.log(`End: ${SignalKTripAnalyzer.getEndTime(delta)!.toISOString()}`)
      console.log(`Path: ${JSON.stringify(simplifiedPath)}`)
    }
    else {
      console.log(JSON.stringify(delta, null, 2))
    }
  }
  else {
    commander.outputHelp()
  }
}

if (require.main === module) {
  babelSignalKCLI(process.argv)
}
