import * as React from "react"
import './TimePanel.css'

export interface TimePanelProps {
  endDate: Date;
  startDate: Date;
  hoveredDate?: Date;
  onTimeJump?: (d: Date) => void;
}

export default function TimePanel({endDate, startDate, hoveredDate, onTimeJump} : TimePanelProps) {
  if (!endDate || !startDate) {
    return (<div className="time-panel"/>);
  }

  // Put a tick every hour and time every 6h.
  // We will need to be smarter with longer logs.
  // TODO: Do not do this math every time we render but keep it cached.
  const tickList = [];
  for (const t = endDate; t < startDate; t) {
    if (t.getTime() % (3600*1000) === 0) {
      if (t.getHours() % 6 === 0) {
        tickList.push(<option key={t.getTime()} value={t.getTime()}/>);
      }
      else {
        tickList.push(<option key={t.getTime()} value={t.getTime()} label={t.getHours() + 'h'}/>);
      }
    }
  }
  return (
    <div className="time-panel">
      <input type="range"
        min={ endDate.getTime() }
        max={ startDate.getTime() }
        list="time-slider-tickmarks"
        value={ hoveredDate ? hoveredDate.getTime() : 0 }
        onChange={ e => onTimeJump ? onTimeJump(new Date(e.target.value)) : true }/>
      <datalist id="time-slider-tickmarks">
        {tickList}
      </datalist>
    </div>
  )
}