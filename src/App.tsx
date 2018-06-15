import * as Papa from 'papaparse'
import * as React from 'react';
import ReactMapGL from 'react-map-gl';
import WebMercatorViewport from 'viewport-mercator-project';

import DataPanel from './components/DataPanel';
import DeckGLOverlay from './components/DeckGLOverlay';
import TimePanel from './components/TimePanel';
import Trip, { GPSCoordinates } from './model/Trip'

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
  trip : Trip|null,
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
        <DataPanel segment={this.state.hoveredObject} />
        {this.state.trip &&
          <TimePanel
          endTime={ this.state.trip.getEndTime() }
          startTime={ this.state.trip.getStartTime() }
          onTimeJump={ x => console.log("on time jump") }
          hoveredDate={ this.state.hoveredObject? this.state.hoveredObject.time : null } />
        }

        <ReactMapGL
          {...this.state.viewport}
          mapStyle={MAPBOX_STYLE}
          mapboxApiAccessToken={MAPBOX_TOKEN}
          onViewportChange={viewport => this._onViewportChange(viewport)}
        >
          <DeckGLOverlay
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
      console.log("onhover", hoverInfo.x, hoverInfo.y, hoverInfo.object);
      this.setState({hoveredObject: hoverInfo.object});
      }
    else {
      console.log("hover - unselected");
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
    let trip : Trip|null = null

    const dataUrl = window.location.origin + SAMPLE_DATA_SFTRIP
    Papa.parse(dataUrl, {
      header: true,
      download: true,
      complete: (parseResult) => {
        if (parseResult.errors.length > 0) {
          console.log("CSV parser threw errors:", parseResult.errors)
        }
        if (parseResult.data) {
          trip = Trip.fromExpeditionData(parseResult.data)
          if (trip && trip.segments.length > 0) {
            const viewport = {
              ...this.state.viewport,
              ...this._calculateViewportForPoints(trip.getBoundingCoordinates()!),
              /*
              transitionDuration: 1000,
              transitionInterpolator: new FlyToInterpolator(),
              transitionEasing: easeCubic*/
            };
            this.setState({viewport, trip});
          }
          else {
            console.log("setting state.trip - with no data");
            this.setState({trip});
          }
        }
      }
    })
  }

  private _calculateViewportForPoints(bc:[GPSCoordinates, GPSCoordinates]) {
    const newViewport = new WebMercatorViewport({
      ...this.state.viewport
    });

    const bounds = newViewport.fitBounds(
      [bc[0], bc[1]],
      {padding: {left: 230 + 20, top: 20, bottom: 20, right: 20}}
    );
    return bounds;
  }
}