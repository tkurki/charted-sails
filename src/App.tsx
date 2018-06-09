import * as React from 'react';
import './App.css';

import ReactMapGL from 'react-map-gl';
// import WebMercatorViewport from 'viewport-mercator-project';
// import sftrip f rom './sample-data/expedition-sanfrancisco.csv';
import { DataWindow } from './components/data-panel';
import { TimePanel } from './components/time-panel';
import DeckGLOverlay from './deckgl-overlay';
import Trip from './model/Trip'

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
        <DataWindow segment={this.state.hoveredObject} />
        <TimePanel
          tripBeginDate={ new Date() }
          tripEndDate={ new Date() }
          onTimeJump={ x => console.log("on time jump") }
          hoveredDate={ this.state.hoveredObject? this.state.hoveredObject.time : null } />

        <ReactMapGL
          {...this.state.viewport}
          mapStyle={MAPBOX_STYLE}
          mapboxApiAccessToken={MAPBOX_TOKEN}
          onViewportChange={viewport => this._onViewportChange(viewport)}
        >
          <DeckGLOverlay
            viewport={this.state.viewport}
            data={this.state.trip}
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
    console.log("componentDidMount (app)");
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
    /*
    let trip = prepareExpeditionData(sftrip);

    if (trip.length > 0) {
      let viewport = {
        ...this.state.viewport,
        ...this._calculateViewportForPoints(trip.map(s => s.coordinates)),
        /*
        transitionDuration: 1000,
        transitionInterpolator: new FlyToInterpolator(),
        transitionEasing: easeCubic*//*
      };

      console.log("setting state.trip", trip);
      // super unefficient to walk the list twice but this is called only once so ...
      let tripBeginDate = trip.reduce((begin, d) => {
        return d.time < begin ? d.time : begin;
      });
      let tripEndDate = trip.reduce((end, d) =>  {
        return d.time > end ? d.time : end;
      });
      console.log("found trip beginning", tripBeginDate);

      this.setState({viewport, trip, tripBeginDate, tripEndDate});
    }
    else {
      console.log("setting state.trip - with no data");
      this.setState({trip});
    }
    */
  }
/*
  private _calculateViewportForPoints(points:GPSCoordinates[]) {
    const newViewport = new WebMercatorViewport({
      ...this.state.viewport
    });

    const boundingPoints : number[4] = points.reduce((bounds:GPSCoordinates, point:GPSCoordinates) => {
      if (bounds.length == 0) {
        return [ point[0], point[0], point[1], point[1] ];
      }
      // Longitude min/max
      bounds[0] = Math.min(bounds[0], point[0]);
      bounds[1] = Math.max(bounds[1], point[0]);
      // Latitude min/max
      bounds[2] = Math.min(bounds[2], point[1]);
      bounds[3] = Math.max(bounds[3], point[1]);
      return bounds;
    }, [ ]);

    let boundingCoordinates = [ [ boundingPoints[0], boundingPoints[2] ], [ boundingPoints[1], boundingPoints[3] ] ];
    console.log(boundingCoordinates);

    const bounds = newViewport.fitBounds(
      boundingCoordinates,
      {padding: {left: 230 + 20, top: 20, bottom: 20, right: 20}}
    );
    return bounds;
  }*/
}