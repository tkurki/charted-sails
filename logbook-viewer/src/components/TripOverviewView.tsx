import * as moment from 'moment';
import * as React from 'react';
import { TripOverview } from "../model/TripOverview";
import './TripOverlayView.css';

export interface TripOverviewViewProps {
  tripOverview: TripOverview
  onTripOverviewSelected: (trip:TripOverview)=>void
}

export function TripOverviewView({tripOverview, onTripOverviewSelected}: TripOverviewViewProps) {
  return (
    <div className="pt-card pt-elevation-2 trip-overview" >
      <a onClick={ () => onTripOverviewSelected(tripOverview) }>{tripOverview.label}</a>
      <div>
        { moment(tripOverview.startTime).calendar() } - { moment(tripOverview.startTime).from(tripOverview.endTime, true)}
      </div>
      <div>
        {tripOverview.description}
      </div>
    </div>
  )
}