import { isNull } from 'util';

/**
 * Class used to represent a selection of time by the user.
 *
 * Selection can be of one specific moment, or a time-span
 * defined by a starting and ending moment.
 */
export default class TimeSelection {
  private start : Date
  private end : Date | null

  constructor(start : Date, end : Date|null = null) {
    this.start = start
    this.end = end
  }

  public includes(d: Date) {
    if (this.isRanged()) {
      return this.start < d && d < this.end!
    }
    else {
      return d === this.start
    }
  }

  public isRanged = () => {
    return !isNull(this.end)
  }

  public getRange() {
    if (this.isRanged()) {
      return [this.start, this.end]
    }
    else {
      return [this.start, this.start]
    }
  }

  /**
   * Duration of the selection in ms.
   * Can be 0 if the selection is not a range.
   */
  public getDuration() {
    if (this.isRanged()) {
      return this.end!.getTime() - this.start.getTime()
    }
    else {
      return 0
    }
  }

  /**
   * Returns the center of the selection which will be the selected
   * time if the selection is not a range.
   */
  public getCenter() {
    return new Date(this.start.getTime() + this.getDuration() / 2)
  }
}