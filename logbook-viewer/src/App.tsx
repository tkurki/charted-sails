import {CSVLoader} from '@aldis/babel-signalk'
import { SKPosition } from '@aldis/strongly-signalk';
import * as React from 'react';
import ReactMapGL, { FlyToInterpolator } from 'react-map-gl';
import WebMercatorViewport from 'viewport-mercator-project';

import DataPanel from './components/DataPanel';
import MyMapControls from './components/MyMapControls';
import TimePanel from './components/TimePanel';
import TripOverlay from './components/TripOverlay';
import TripSelectorOverlay from './components/TripSelectorOverlay';
import InteractiveTrip from './model/InteractiveTrip';
import { SKDeltaDataProvider } from './model/SKDeltaDataProvider';
import TimeSelection from './model/TimeSelection';
import { TripOverview } from './model/TripOverview';

import './App.css'

import SAMPLE_DATA_AUCKLAND from './sample-data/expedition-auckland.csv'
import SAMPLE_DATA_SF from './sample-data/expedition-sanfrancisco.csv'
import SAMPLE_DATA_SOLENT from './sample-data/expedition-solent.csv'
import SAMPLE_DATA_VALENCIA from './sample-data/expedition-valencia.csv'

// const MAPBOX_STYLE = 'mapbox://styles/mapbox/dark-v9';
const MAPBOX_STYLE = 'mapbox://styles/sarfata/cjhz42qo83ycz2rpn6f1smby1'
const MAPBOX_TOKEN = 'pk.eyJ1Ijoic2FyZmF0YSIsImEiOiJjamh6NDFpdXMwdGRoM3FvMWp4bXc3bnAzIn0.29zQaAsB4kd3s2QABMkA3Q'

if (!MAPBOX_TOKEN) {
  alert('The mapbox token is not defined.');
}

const tripOverviews : TripOverview[] = [
  {
    label: 'Expedition - San Francisco',
    startTime: new Date("19790401T091012Z"),
    endTime: new Date("19790401T091013Z"),
    path: [
      new SKPosition(37.806633,-122.445967),
      new SKPosition(37.8197,-122.4053),
      new SKPosition(37.806467,-122.445767)
    ],
    getSKDelta: () => CSVLoader.fromURL(window.location.origin + SAMPLE_DATA_SF)
  },
  {
    label: 'Expedition - Valencia',
    startTime: new Date("19790403T091012Z"),
    endTime: new Date("19790411T091012Z"),
    path: [
      new SKPosition(39.400246,-0.299097),
      new SKPosition(39.378036,-0.281803)
    ],
    getSKDelta: () => CSVLoader.fromURL(window.location.origin + SAMPLE_DATA_VALENCIA)
  },
  {
    label: 'Expedition - Auckland',
    startTime: new Date("19790403T091012Z"),
    endTime: new Date("19790411T091012Z"),
    path: [
      new SKPosition(-36.731609,174.904436),
      new SKPosition(-36.81844,174.853202)
    ],
    getSKDelta: () => CSVLoader.fromURL(window.location.origin + SAMPLE_DATA_AUCKLAND)
  },
  {
    label: 'Expedition - Solent',
    startTime: new Date("19790403T091012Z"),
    endTime: new Date("19790411T091012Z"),
    path: [
      new SKPosition(50.76229,-1.36405),
      new SKPosition(50.767278,-1.350746)
    ],
    getSKDelta: () => CSVLoader.fromURL(window.location.origin + SAMPLE_DATA_SOLENT)
  }
]
// tslint:disable-next-line:no-empty-interface
export interface AppProps {
}

export interface AppState {
  animating: boolean
  viewport : any
  trip: InteractiveTrip|null,
  hoveredObject?: any
}

export default class App extends React.Component<AppProps, AppState> {
  private mapControls = new MyMapControls()

  constructor(props : AppProps) {
    super(props);

    this.state = {
      animating: true,
      trip: null,
      viewport: {
        height: window.innerHeight,
        width: window.innerWidth,
        longitude: -130.4,
        latitude: 37.8,
        zoom: 1,
        maxZoom: 16
      }
    }
    this._resize = this._resize.bind(this);

    this.mapControls.setOptions({ onUserInteraction: () => {
        this.setState({ animating: false })
      }
    })
  }

  public render() {
    return (
      <div>
        {this.state.trip &&
          <DataPanel
            dataProvider={ this.state.trip.getDataProvider() }
            hoveringMode={ this.state.hoveredObject ? true : false }
            selection={ this.state.trip.getSelection() } />
        }
        {this.state.trip &&
          <TimePanel
            endTime={ this.state.trip.getEndTime() }
            startTime={ this.state.trip.getStartTime() }
            // FIXME: Need a better way to initialize selectedSegment! This should never be null when we have a trip.
            selectedTime={ this.state.trip.getSelection().getCenter() }
            onSelectedTimeChange={ t => this._onSelectedTimeChange(t) }
          />
        }

        <ReactMapGL
          {...this.state.viewport}
          mapControls={this.mapControls}
          mapStyle={MAPBOX_STYLE}
          mapboxApiAccessToken={MAPBOX_TOKEN}
          onViewportChange={viewport => this._onViewportChange(viewport)}
        >
          {this.state.trip &&
            <TripOverlay
              viewport={this.state.viewport}
              trip={this.state.trip != null ? this.state.trip : undefined }
              onHover={(hover : any) => this._onHover(hover)}
            />
          }
          {!this.state.trip &&
            <TripSelectorOverlay
              tripOverviews={tripOverviews}
              viewport={this.state.viewport}
              onTripOverviewSelected={x => this.tripOverviewSelected(x) }
            />
          }
        </ReactMapGL>
      </div>
    );
  }

  public _onHover(hoverInfo : any) {
    if (hoverInfo) {
      this.setState({hoveredObject: hoverInfo.object});
      }
    else {
      this.setState({hoveredObject: null});
    }
  }

  public _onViewportChange(viewport : any) {
    this.setState({
      viewport: {...this.state.viewport, ...viewport}
    });
  }

  public componentDidMount() {
    window.addEventListener('resize', this._resize);
    this._resize();
    this.animateMap()
  }

  public componentWillUnmount() {
    window.removeEventListener('resize', this._resize);
  }

  public _resize() {
    this.setState({
      viewport: {
        ...this.state.viewport,
        width: window.innerWidth,
        height: window.innerHeight
      }
    });
  }

  private tripOverviewSelected(t: TripOverview) {
    t.getSKDelta().then(delta => {
      const trip = new InteractiveTrip(delta, new SKDeltaDataProvider(delta))

      const viewport = {
        ...this.state.viewport,
        ...this._calculateViewportBounding(trip.getBounds()),
        transitionDuration: 1000,
        transitionInterpolator: new FlyToInterpolator(),
        /*transitionEasing: easeCubic*/
      }
      this.setState({viewport, trip, animating: false})
    })
    .catch(error => {
      console.log("Unable to log trip", error)
      this.setState({trip: null})
    })
    console.log(`Trip selected: ${t}`)
  }

  private animateMap() {
    if (this.state.animating) {
      this.setState({
        viewport: {
          ...this.state.viewport,
          longitude: this.state.viewport.longitude + Math.random() * 30 + 30,
          latitude: Math.random() * 70 -35,
          zoom: Math.random() * 3 + 2,
          transitionInterpolator: new FlyToInterpolator(),
          transitionDuration: 3000
        }
      })
      setTimeout(x => this.animateMap(), 3000)
    }
  }

  private _calculateViewportBounding(boundingPositions: [SKPosition, SKPosition]) {
    const newViewport = new WebMercatorViewport({
      ...this.state.viewport
    });

    const bounds = newViewport.fitBounds(
      [boundingPositions[0].asArray(), boundingPositions[1].asArray()],
      {padding: {left: 230 + 20, top: 20, bottom: 20, right: 20}}
    );
    return bounds;
  }

  /**
   * Called when the user has selected a new time by dragging the time slider.
   * @param t new time selected
   */
  private _onSelectedTimeChange(t : Date) {
    if (this.state.trip) {
      this.state.trip.setSelection(new TimeSelection(t))
      this.setState({trip: this.state.trip})
    }
  }

}