import { Card, HandleInteractionKind, HandleType, Intent, MultiSlider, Slider } from '@blueprintjs/core';
import moment from 'moment';
import * as React from "react";
import './TimePanel.css';

export interface TimePanelProps {
  endTime: Date;
  startTime: Date;
  selectedTime: Date
  onSelectedTimeChange: (d: Date) => void
  style?: React.CSSProperties
  /// Should the start and end bounds be editable by the user?
  editableBounds?: boolean
  /// Current value of the startBound, should always be >= startTime
  startBoundTime?: Date
  /// Current value of the endBound, should always be <= endBound
  endBoundTime?: Date
  /// Called whenever user has changed the start or end bounds.
  onBoundsChanged?: (start:Date, end: Date) => void
}

export default class TimePanel extends React.Component<TimePanelProps> {
  private timeRanges = [
    { stepSize: 24*3600*1000, renderer: (t:number) => moment(t).format('l LT') },
    { stepSize: 10*60*1000, renderer: (t:number) => moment(t).format('LT') },
    { stepSize: 60*1000, renderer: (t:number) => moment(t).format('LT') },
    { stepSize: 1000, renderer: (t:number) => moment(t).format('LTS') },
    { stepSize: 1, renderer: (t:number) => moment(t).format('LTS') }
  ]

  constructor(props: TimePanelProps) {
    super(props)
    this.onSelectedTimeChange = this.onSelectedTimeChange.bind(this)
    this.onStartBoundChanged = this.onStartBoundChanged.bind(this)
    this.onEndBoundChanged = this.onEndBoundChanged.bind(this)
  }

  public render() {
    const {endTime, startTime, selectedTime } = this.props

    if (!endTime || !startTime) {
      return (<div className="time-panel"/>);
    }

    // How long is the range?
    const rangeDuration = endTime.getTime() - startTime.getTime()
    const range = this.timeRanges.filter((r) => rangeDuration > r.stepSize )[0]

    if (this.props.editableBounds) {
      const startBoundValue = this.props.startBoundTime ? this.props.startBoundTime.getTime() : startTime.getTime()
      const endBoundValue = this.props.endBoundTime ? this.props.endBoundTime.getTime() : endTime.getTime()

      return (
        <Card elevation={2} className="time-panel" style={ this.props.style}>
          <MultiSlider
            min={ startTime.getTime() }
            max={ endTime.getTime() }
            showTrackFill={true}
            labelRenderer={range.renderer}
            labelStepSize={this.calculateLabelStepSize(rangeDuration, range.stepSize, 7)}
            stepSize={100}
          >
            <MultiSlider.Handle value={ startBoundValue } onChange={ this.onStartBoundChanged }
              type={HandleType.START} intentBefore={Intent.DANGER}
            />
            <MultiSlider.Handle value={ selectedTime.getTime() } onChange={ this.onSelectedTimeChange }  interactionKind={HandleInteractionKind.PUSH}/>
            <MultiSlider.Handle value={ endBoundValue } onChange={ this.onEndBoundChanged }
              type={HandleType.END} intentAfter={Intent.DANGER}
            />
          </MultiSlider>
        </Card>
      )
    }
    else {
      return (
        <Card elevation={2} className="time-panel" style={ this.props.style}>
          <Slider
            min={ startTime.getTime() }
            max={ endTime.getTime() }
            value={ selectedTime.getTime() }
            onChange={ this.onSelectedTimeChange }
            showTrackFill={false}
            labelRenderer={range.renderer}
            labelStepSize={this.calculateLabelStepSize(rangeDuration, range.stepSize, 7)}
            stepSize={100}
            />
        </Card>
      )
    }
  }

  private onSelectedTimeChange(t:number) {
    this.props.onSelectedTimeChange(new Date(t))
  }

  private onStartBoundChanged(start:number) {
    if (this.props.onBoundsChanged) {
      this.props.onBoundsChanged(new Date(start), this.props.endBoundTime ? this.props.endBoundTime : this.props.endTime)
    }
  }

  private onEndBoundChanged(end:number) {
    if (this.props.onBoundsChanged) {
      this.props.onBoundsChanged(this.props.startBoundTime ? this.props.startBoundTime : this.props.startTime, new Date(end))
    }
  }

  private calculateLabelStepSize(duration: number, intervalBetweenLabel:number, labelsCount: number) {
    return Math.max(intervalBetweenLabel, Math.round(duration / (labelsCount * intervalBetweenLabel)) * intervalBetweenLabel)
  }
}