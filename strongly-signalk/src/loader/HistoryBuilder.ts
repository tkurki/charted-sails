import equal from 'deep-equal';
import { SKDelta } from "../model";
import { SKHistory } from "../model/history/SKHistory";
import { SKObjectHistory } from "../model/history/SKObjectHistory";
import { SKPropertyHistory } from '../model/history/SKPropertyHistory';

export class HistoryBuilder {
  private addedDeltas : SKDelta[] = []

  public addDelta(delta: SKDelta) {
    this.addedDeltas.push(delta)
  }

  public retrieve(): SKHistory {
    if (this.addedDeltas.length == 0) {
      throw new Error('Cannot build empty history')
    }

    const history = new SKHistory()

    this.addedDeltas.forEach(delta => {
      // FIXME: should expand an existing history if we already have one for this context
      if (!delta.context) {
        throw new Error('Cannot generate history without context.')
      }
      if (history.objects.map(object => object.context).includes(delta.context)) {
        throw new Error('Not smart enough to combine two deltas for the same vessel into one history.')
      }
      const objectHistory = new SKObjectHistory(delta.context)

      // Very simple two-pass algorithm:
      // 1. Go over all updates to see what path/source exist in the dataset
      delta.updates.forEach(update => {
        update.values.forEach(skvalue => {
          if (!update.source) {
            throw new Error('Cannot write history without reliable sources (update without source).')
          }
          if (objectHistory.properties.filter(p => p.path === skvalue.path && equal(p.source, update.source)).length === 0) {
            objectHistory.properties.push(new SKPropertyHistory(skvalue.path, update.source))
          }
        })
      })

      // 2. Go over each update and add actual value (or null) for each known path/source
      delta.updates.forEach(update => {
        objectHistory.timestamps.push(update.timestamp)
        objectHistory.properties.forEach(property => {
          const v = update.values.filter(v => v.path === property.path && equal(update.source, property.source))
          if (v.length == 0) {
            property.values.push(null)
          }
          else if (v.length == 1) {
            property.values.push(v[0].value)
          }
          else {
            throw new Error(`Found ${v.length} values with identical source (${JSON.stringify(property.source)} and path (${property.path}) in one update (ts=${update.timestamp}).`)
          }
        })
      })
      if (objectHistory.properties.length > 0) {
        history.objects.push(objectHistory)
      }
    })
    if (history.objects.length === 0) {
      throw new Error('Cannot build empty history')
    }
    history.startDate = history.objects.reduce<Date>((startDate, object) => {
      if (object.timestamps[0].getTime() < startDate.getTime()) {
        return object.timestamps[0]
      }
      return startDate
    }, new Date())
    history.endDate = history.objects.reduce<Date>((endDate, object) => {
      if (object.timestamps[0].getTime() < endDate.getTime()) {
        return object.timestamps[0]
      }
      return endDate
    }, history.startDate)

    return history
  }
}