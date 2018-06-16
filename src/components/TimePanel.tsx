import Slider from "rc-slider";
import * as React from "react"
import { Segment } from "../model/Trip";

import 'rc-slider/assets/index.css';
import './TimePanel.css'

export interface TimePanelProps {
  endTime: Date;
  startTime: Date;
  selectedSegment: Segment
  onSelectedTimeChange: (d: Date) => void;
}

export default function TimePanel({endTime, startTime, selectedSegment, onSelectedTimeChange} : TimePanelProps) {
  if (!endTime || !startTime) {
    return (<div className="time-panel"/>);
  }

  // Put a tick every hour and time every 6h.
  // We will need to be smarter with longer logs.
  // TODO: Do not do this math every time we render but keep it cached.
  const tickList = {};

  const firstHourMark = new Date(startTime)
  firstHourMark.setMinutes(0)
  firstHourMark.setSeconds(0)
  firstHourMark.setMilliseconds(0)

  for (let t = firstHourMark; t < endTime; t = new Date(t.getTime() + 3600 * 1000)) {
    tickList[t.getTime()] = t.getHours() + 'h'
  }

  return (
    <div className="time-panel">
      <Slider
        min={ startTime.getTime() }
        max={ endTime.getTime() }
        marks={ tickList }
        value={ selectedSegment.start.time.getTime() }
        onChange={ e => { onSelectedTimeChange(new Date(e)) } }/>
    </div>
  )
}