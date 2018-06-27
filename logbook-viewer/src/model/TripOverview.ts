import { SKDelta } from "@aldis/strongly-signalk";

export interface TripOverview {
  path: Array<[number, number]>
  label: string
  description?: string
  startTime: Date
  endTime: Date
  getSKDelta: () => Promise<SKDelta>
}