import { Button, ButtonGroup, Card, HandleInteractionKind, HandleType, Intent, MultiSlider, Slider } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import moment from 'moment';
import * as React from "react";
import './TimePanel.css';

export interface TimePanelProps {
  endTime: Date;
  startTime: Date;
  selectedTime: Date
  onSelectedTimeChange: (d: Date) => void

  playSpeed: number
  onPlaySpeedChange: (speed: number) => void

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
    this.onPlaySpeedChange = this.onPlaySpeedChange.bind(this)
    this.onStartBoundChange = this.onStartBoundChange.bind(this)
    this.onEndBoundChange = this.onEndBoundChange.bind(this)
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
          <div className="time-panel-wrapper">
            <MultiSlider
              min={ startTime.getTime() }
              max={ endTime.getTime() }
              showTrackFill={true}
              labelRenderer={range.renderer}
              labelStepSize={this.calculateLabelStepSize(rangeDuration, range.stepSize, 7)}
              stepSize={100}
              defaultTrackIntent={Intent.PRIMARY}
              className="time-panel-slider"
            >
              <MultiSlider.Handle value={ startBoundValue } onChange={ this.onStartBoundChange }
                type={HandleType.START} intentBefore={Intent.NONE}
              />
              <MultiSlider.Handle value={ selectedTime.getTime() } onChange={ this.onSelectedTimeChange } interactionKind={HandleInteractionKind.PUSH}/>
              <MultiSlider.Handle value={ endBoundValue } onChange={ this.onEndBoundChange }
                type={HandleType.END} intentAfter={Intent.NONE}
              />
            </MultiSlider>
          </div>
        </Card>
      )
    }
    else {
      return (
        <Card elevation={2} className="time-panel" style={ this.props.style}>
          <div className="time-panel-wrapper">
            <Slider
              min={ startTime.getTime() }
              max={ endTime.getTime() }
              value={ selectedTime.getTime() }
              onChange={ this.onSelectedTimeChange }
              showTrackFill={false}
              labelRenderer={range.renderer}
              labelStepSize={this.calculateLabelStepSize(rangeDuration, range.stepSize, 7)}
              stepSize={100}
              className="time-panel-slider"
              />
            <ButtonGroup
              className="time-panel-buttons"
              >
              <Button icon={ IconNames.PAUSE } active={ this.props.playSpeed === 0 }
                onClick={ () => this.onPlaySpeedChange(0) }/>
              <Button icon={ IconNames.STEP_FORWARD } active={ this.props.playSpeed > 0 && this.props.playSpeed < 60 }
                onClick={ () => this.onPlaySpeedChange(1) }/>
              <Button icon={ IconNames.PLAY } active={ this.props.playSpeed >= 60 && this.props.playSpeed < 3600 }
                onClick={ () => this.onPlaySpeedChange(60) }/>
              <Button icon={ IconNames.FAST_FORWARD } active={ this.props.playSpeed >= 3600 }
                onClick={ () => this.onPlaySpeedChange(3600) }/>
            </ButtonGroup>
          </div>
        </Card>
      )
    }
  }

  private onSelectedTimeChange(t:number) {
    this.props.onSelectedTimeChange(new Date(t))
  }

  private onPlaySpeedChange(s:number) {
    this.props.onPlaySpeedChange(s)
  }

  private onStartBoundChange(start:number) {
    if (this.props.onBoundsChanged) {
      this.props.onBoundsChanged(new Date(start), this.props.endBoundTime ? this.props.endBoundTime : this.props.endTime)
    }
  }

  private onEndBoundChange(end:number) {
    if (this.props.onBoundsChanged) {
      this.props.onBoundsChanged(this.props.startBoundTime ? this.props.startBoundTime : this.props.startTime, new Date(end))
    }
  }

  private calculateLabelStepSize(duration: number, intervalBetweenLabel:number, labelsCount: number) {
    return Math.max(intervalBetweenLabel, Math.round(duration / (labelsCount * intervalBetweenLabel)) * intervalBetweenLabel)
  }
}