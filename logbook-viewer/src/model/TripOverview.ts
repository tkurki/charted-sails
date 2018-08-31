
export interface TripOverview {
  path: Array<[number, number]>
  label: string
  description?: string
  startTime: Date
  endTime: Date
  url: string
}