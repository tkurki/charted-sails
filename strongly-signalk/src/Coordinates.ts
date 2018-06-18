export class Coordinates {
  public latitude: number
  public longitude: number
  public altitude?: number

  public asArray() {
    return [this.longitude, this.latitude]
  }
}