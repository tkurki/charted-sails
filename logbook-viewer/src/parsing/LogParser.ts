import { BetterDataProvider } from "@aldis/strongly-signalk";
import { EventEmitter } from "events";
import ParserWorker from "worker-loader!./ParserWorker";
import InteractiveTrip from "../model/InteractiveTrip";

declare interface LogParserEventsEmitter {
  on(event: 'progress', listener: (progress:number) => void): this
}

interface LogParserOutput {
  trip: InteractiveTrip
  timeSpent?: number
}

interface ParserWorkerCommandLoadFile {
  label: string
  file: File
  command: 'parseFile'
}

interface ParserWorkerCommandLoadURL {
  label: string
  url: string
  command: 'parseURL'
}

type ParserWorkerCommand = ParserWorkerCommandLoadFile | ParserWorkerCommandLoadURL

/**
 * Promise based interface to load log files.
 *
 * Will use a WebWorker to load asynchronously.
 */
export default class LogParser extends EventEmitter implements LogParserEventsEmitter {
  public openURL(url: string) {
    return this.parseWithCommand({command:'parseURL', url, label: url})
  }

  public openFile(file: File) {
    return this.parseWithCommand({command:'parseFile', file, label: file.name})
  }

  private parseWithCommand(workerCommand: ParserWorkerCommand) {
    return new Promise<LogParserOutput>((resolve, reject) => {
      performance.mark('logparser-start')
      const worker = new ParserWorker()
      performance.mark('worker-started')

      // Set up the worker
      worker.onerror = e => {
        worker.terminate()
        return reject(e.message)
      }

      worker.onmessage = ({data}) => {
        if ('error' in data) {
          worker.terminate()
          return reject(data.error)
        }
        if ('delta' in data && 'dataProvider' in data) {
          // rebuild the objects
          performance.mark('rehydrate-start')
          const provider = BetterDataProvider.fromJSON(data.dataProvider)
          performance.mark('rehydrate-end')
          const trip = new InteractiveTrip(provider.getTripData(), provider, workerCommand.label)
          performance.mark('interactive-end')

          // Collect some performance measurements
          performance.measure('CS: Open file', 'logparser-start', 'interactive-end')
          performance.measure('CS: Worker start', 'logparser-start', 'worker-started')
          performance.measure('CS: Rehydrate', 'rehydrate-start', 'rehydrate-end')
          performance.measure('CS: I.Trip', 'rehydrate-end', 'interactive-end')

          const measure = performance.getEntriesByName("CS: Open file").pop()

          worker.terminate()
          return resolve({ trip, timeSpent: measure ? measure.duration : undefined })
        }
        worker.terminate()
        return reject('invalid worker response :/')
      }

      // Start working
      worker.postMessage(workerCommand)
      performance.mark('worker-running')
    })
  }
}