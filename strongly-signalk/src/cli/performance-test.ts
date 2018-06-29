import { BetterDataProvider } from "../analysis/BetterDataProvider";
import { SignalKTripAnalyzer } from "../analysis/SignalKTripAnalyzer";
import { SKDeltaDataProvider } from "../analysis/SKDeltaDataProvider";
import { TripDataProvider } from "../analysis/TripDataProvider";
import { readFileSync } from "fs";
import { CSVLoader } from "../loader/CSVLoader";
import { SKDelta } from "../model/SKDelta";

let data = readFileSync('../logbook-viewer/src/sample-data/expedition-sanfrancisco.csv', { 'encoding': 'utf8'})
let delta = CSVLoader.fromString(data)

const dataSamplingInterval = 5 * 60 * 1000
benchmarkDataProvider('SKDeltaDataProvider', (delta) => (new SKDeltaDataProvider(delta)), dataSamplingInterval)
benchmarkDataProvider('BetterDataProvider', (delta) => (new BetterDataProvider(delta)), dataSamplingInterval)

function benchmarkDataProvider(label:string, getOne:(delta:SKDelta)=>TripDataProvider, interval: number) {
  let deltaStartTime = SignalKTripAnalyzer.getStartTime(delta)!
  let deltaEndTime = SignalKTripAnalyzer.getEndTime(delta)!

  let results = [0, 1, 2].map(() => {
    console.log('.')
    return benchmark(getOne, deltaStartTime, deltaEndTime, interval)
  })

  results.reduce((previous, result) => {
    if (result.count != previous.count) {
      throw new Error(`Not all results have same count: ${JSON.stringify(results)}`)
    }
    return result
  })
  let elapsedTimesUS = results.map(({elapsed: [elapsedSeconds, elapsedNanoseconds]}) => {
    return elapsedSeconds * 1e6 + elapsedNanoseconds / 1e3
  })
  let average = elapsedTimesUS.reduce((p, v) => p+v)/elapsedTimesUS.length

  let preciseSum = results.reduce((p, {elapsed}) => ([p[0]+elapsed[0], p[1]+elapsed[1]]), [0,0])
  let totalSamples = results[0].count * results.length
  let preciseTimePerSample = [preciseSum[0]/totalSamples, preciseSum[1]/totalSamples] as [number,number]

  let sumInitTime = results.reduce((sum, {initTime}) => ([sum[0]+initTime[0], sum[1]+initTime[1]]), [0,0])
  let avgInitTime = sumInitTime.map(x => x / results.length) as [number, number]
  console.log(`Avg elapsed run time for ${label}: ${usToString(average)} - excluding avg init time: ${preciseTimeToString(avgInitTime)}`)

  console.log(`${results[0].count} values fetched - ${preciseTimeToString(preciseTimePerSample)} per value (excluding init time)`)
}

function benchmark(getOne:(delta:SKDelta)=>TripDataProvider, start: Date, end: Date, interval: number) {
  let count = 0
  let startTime = process.hrtime()
  let dataProvider = getOne(delta)
  let initTime = process.hrtime(startTime)
  startTime = process.hrtime()
  for (let i = start.getTime(); i < end.getTime(); i += interval) {
    dataProvider.getValuesAtTime(new Date(i))
    count++
  }
  let elapsed = process.hrtime(startTime)

  return { initTime, count, elapsed }
}

function preciseTimeToString([seconds, nanoseconds]:[number,number]) {
  if (seconds > 1) {
    return `${(seconds+nanoseconds*1e-9).toFixed(3)}s`
  }
  if (seconds > 0.001 || nanoseconds > 1e6) {
    return `${(seconds*1e3+nanoseconds*1e-6).toFixed(3)}ms`
  }
  if (nanoseconds > 1e3) {
    return `${(seconds*1e6+nanoseconds*1e-3).toFixed(3)}us`
  }
  return `${(seconds*1e9+nanoseconds).toFixed(3)}ns`
}

function usToString(microseconds:number) {
  if (microseconds > 1e6) {
    return `${(microseconds/1e6).toFixed(3)}s`
  }
  if (microseconds > 1e3) {
    return `${(microseconds/1e3).toFixed(3)}ms`
  }
  if (microseconds > 1) {
    return `${(microseconds).toFixed(3)}us`
  }
  return `${(microseconds*1e3).toFixed(3)}ns`
}