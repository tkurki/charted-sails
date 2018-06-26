import { SKDelta, SKPosition } from "@aldis/strongly-signalk";

export interface TripOverview {
  path: SKPosition[]
  label: string
  description?: string
  startTime: Date
  endTime: Date
  getSKDelta: () => Promise<SKDelta>
}