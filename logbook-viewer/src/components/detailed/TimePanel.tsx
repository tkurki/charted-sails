import { Slider } from '@blueprintjs/core';
import * as moment from 'moment'
import * as React from "react";
import './TimePanel.css';

export interface TimePanelProps {
  endTime: Date;
  startTime: Date;
  selectedTime: Date
  onSelectedTimeChange: (d: Date) => void
  style?: React.CSSProperties
}

export default class TimePanel extends React.Component<TimePanelProps> {
  private timeRanges = [
    { stepSize: 24*3600*1000, renderer: (t:number) => moment(t).format('l LT') },
    { stepSize: 10*60*1000, renderer: (t:number) => moment(t).format('LT') },
    { stepSize: 60*1000, renderer: (t:number) => moment(t).format('LT') },
    { stepSize: 1000, renderer: (t:number) => moment(t).format('LTS') },
    { stepSize: 1, renderer: (t:number) => moment(t).format('LTS') }
  ]

  public render() {
    const {endTime, startTime, selectedTime, onSelectedTimeChange} = this.props

    if (!endTime || !startTime) {
      return (<div className="time-panel"/>);
    }

    // How long is the range?
    const rangeDuration = endTime.getTime() - startTime.getTime()
    const range = this.timeRanges.filter((r) => rangeDuration > r.stepSize )[0]

    return (
      <div className="pt-card pt-elevation-2 time-panel" style={ this.props.style }>
        <Slider
          min={ startTime.getTime() }
          max={ endTime.getTime() }
          value={ selectedTime.getTime() }
          onChange={ e => { onSelectedTimeChange(new Date(e)) } }
          showTrackFill={false}
          labelRenderer={range.renderer}
          labelStepSize={this.calculateLabelStepSize(rangeDuration, range.stepSize, 7)}
          stepSize={100}
          />
      </div>
    )
  }

  private calculateLabelStepSize(duration: number, intervalBetweenLabel:number, labelsCount: number) {
    return Math.max(1000, Math.round(duration / (labelsCount * intervalBetweenLabel)) * intervalBetweenLabel)
  }
}