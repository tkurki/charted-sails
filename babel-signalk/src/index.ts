export * from './CSVLoader'
export * from './ExpeditionFormatConversion'

// If ran from the command line we offer a simple CLI

import * as commander from 'commander'
import * as pkgInfo from '../package.json'
import { CSVLoader, CSVConversionOption } from './CSVLoader';
import { ExpeditionFormatConversion } from './ExpeditionFormatConversion';
import { readFileSync } from 'fs';

if (require.main === module) {
  commander.version(pkgInfo.version)
  commander.usage("[options] <path>")
  commander.description("Convert Expedition logfile to SignalK")
  commander.parse(process.argv)

  if (commander.args.length > 0) {
    let options: CSVConversionOption = {
      "sourceLabel": commander.args[0],
      "conversion": new ExpeditionFormatConversion()
    }

    let data = readFileSync(commander.args[0], { 'encoding': 'utf8'})
    let delta = CSVLoader.fromString(data, options)
    console.log(JSON.stringify(delta, null, 2))
  }
  else {
    commander.outputHelp()
  }
}