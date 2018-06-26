import {CSVLoader} from '@aldis/babel-signalk'
import { SKPosition } from '@aldis/strongly-signalk';
import * as React from 'react';
import ReactMapGL, { FlyToInterpolator } from 'react-map-gl';
import WebMercatorViewport from 'viewport-mercator-project';

import DataPanel from './components/DataPanel';
import TimePanel from './components/TimePanel';
import TripOverlay from './components/TripOverlay';
import InteractiveTrip from './model/InteractiveTrip';
import { SKDeltaDataProvider } from './model/SKDeltaDataProvider';
import TimeSelection from './model/TimeSelection';

import './App.css'
import SAMPLE_DATA_SFTRIP from './sample-data/expedition-sanfrancisco.csv'

// const MAPBOX_STYLE = 'mapbox://styles/mapbox/dark-v9';
const MAPBOX_STYLE = 'mapbox://styles/sarfata/cjhz42qo83ycz2rpn6f1smby1'
const MAPBOX_TOKEN = 'pk.eyJ1Ijoic2FyZmF0YSIsImEiOiJjamh6NDFpdXMwdGRoM3FvMWp4bXc3bnAzIn0.29zQaAsB4kd3s2QABMkA3Q'

if (!MAPBOX_TOKEN) {
  alert('The mapbox token is not defined.');
}

// tslint:disable-next-line:no-empty-interface
export interface AppProps {

}

export interface AppState {
  viewport : any
  trip: InteractiveTrip|null,
  hoveredObject?: any
}

export default class App extends React.Component<AppProps, AppState> {
  constructor(props : AppProps) {
    super(props);

    this.state = {
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
          mapStyle={MAPBOX_STYLE}
          mapboxApiAccessToken={MAPBOX_TOKEN}
          onViewportChange={viewport => this._onViewportChange(viewport)}
        >
          <TripOverlay
            viewport={this.state.viewport}
            trip={this.state.trip != null ? this.state.trip : undefined }
            onHover={(hover : any) => this._onHover(hover)}
          />
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
    this._processData();
  }

  public componentWillUnmount() {
    window.removeEventListener('resize', this._resize);
  }

  public _resize() {
    this._onViewportChange({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }

  public _processData() {
    const dataUrl = window.location.origin + SAMPLE_DATA_SFTRIP

    CSVLoader.fromURL(dataUrl).then(delta => {
      const trip = new InteractiveTrip(delta, new SKDeltaDataProvider(delta))

      const viewport = {
        ...this.state.viewport,
        ...this._calculateViewportBounding(trip.getBounds()),
        transitionDuration: 1000,
        transitionInterpolator: new FlyToInterpolator(),
        /*transitionEasing: easeCubic*/
      }
      this.setState({viewport, trip})
    })
    .catch(error => {
      console.log("Unable to log trip", error)
      this.setState({trip: null})
    })
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