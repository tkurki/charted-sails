import { storiesOf } from '@storybook/react';
import moment from 'moment';
import * as React from 'react';
import '../../index.css';
import { TripOverviewView } from './TripOverviewView';

storiesOf("Components/TripOverviewView", module)
  .add('simple marker', () => (
    <TripOverviewView tripOverview={ {
      startTime: moment("20180612T093301").toDate(),
      endTime: moment("20180612T130101").toDate(),
      description: "Just a basic trip overview",
      label: "My Trip Overview",
      path: [
        [0, 0], [10, 10]
      ],
      url: '/mytrip.log'
    } } onTripOverviewSelected={ () => true }/>
    )
  )
