import { Card } from '@blueprintjs/core';
import moment from 'moment';
import * as React from 'react';
import { TripOverview } from "../../model/TripOverview";
import './TripOverviewView.css';

export interface TripOverviewViewProps {
  tripOverview: TripOverview
  onTripOverviewSelected: (trip:TripOverview)=>void
}

export function TripOverviewView({tripOverview, onTripOverviewSelected}: TripOverviewViewProps) {
  return (
    <Card elevation={2} className="trip-overview">
      <a onClick={ () => onTripOverviewSelected(tripOverview) }>{tripOverview.label}</a>
      <div>
        { moment(tripOverview.startTime).calendar() } - { moment(tripOverview.startTime).from(tripOverview.endTime, true)}
      </div>
      <div>
        {tripOverview.description}
      </div>
    </Card>
  )
}