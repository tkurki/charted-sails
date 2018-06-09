import * as React from "react"
import './TimePanel.css'

export interface TimePanelProps {
  tripBeginDate: Date;
  tripEndDate: Date;
  hoveredDate?: Date;
  onTimeJump: (d: Date) => void;
}

export function TimePanel({tripBeginDate, tripEndDate, hoveredDate, onTimeJump} : TimePanelProps) {
  if (!tripBeginDate || !tripEndDate) {
    return (<div className="time-panel"/>);
  }

  console.log("rendering time panel");
  console.log(tripBeginDate);
  console.log(tripEndDate);

  // Put a tick every hour and time every 6h.
  // We will need to be smarter with longer logs.
  // TODO: Do not do this math every time we render but keep it cached.
  let tickList = [];
  for (let t = tripBeginDate; t < tripEndDate; t) {
    if (t.getTime() % (3600*1000) === 0) {
      if (t.getHours() % 6 == 0) {
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
        min={ tripBeginDate.getTime() }
        max={ tripEndDate.getTime() }
        list="time-slider-tickmarks"
        value={ hoveredDate ? hoveredDate.getTime() : 0 }
        onChange={ e => onTimeJump(new Date(e.target.value)) }/>
      <datalist id="time-slider-tickmarks">
        {tickList}
      </datalist>
    </div>
  )
}