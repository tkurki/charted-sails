import React, { Component } from 'react';
import ReactMapGL from 'react-map-gl';
import WebMercatorViewport from 'viewport-mercator-project';
import sftrip from '../data/expedition-sanfrancisco.csv';
import DeckGLOverlay from './deckgl-overlay';
import { prepareExpeditionData } from './processing/expedition';
import { DataPanel, DataPanelItem, DataWindow } from './components/data-panel';



//const MAPBOX_STYLE = 'mapbox://styles/mapbox/dark-v9';
const MAPBOX_STYLE = 'mapbox://styles/sarfata/cjhz42qo83ycz2rpn6f1smby1';
const MAPBOX_TOKEN = process.env.MapboxAccessToken;

if (!MAPBOX_TOKEN) {
  alert('The mapbox token is not defined.');
}

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        longitude: -130.4,
        latitude: 37.8,
        zoom: 1,
        maxZoom: 16
      },
      trip: []
    };
    this._resize = this._resize.bind(this);
  }

  render() {
    return (
      <div>
        <DataWindow segment={this.state.hoveredObject} />
      
        <ReactMapGL
          {...this.state.viewport}
          mapStyle={MAPBOX_STYLE}
          mapboxApiAccessToken={MAPBOX_TOKEN} 
          onViewportChange={viewport => this._onViewportChange(viewport)}
        >
          <DeckGLOverlay
            viewport={this.state.viewport}
            data={this.state.trip}
            onHover={hover => this._onHover(hover)}
          />
        </ReactMapGL>
      </div>
    );
  }

  _onHover(hoverInfo) {
    if (hoverInfo) {
      console.log("onhover", hoverInfo.x, hoverInfo.y, hoverInfo.object);
      this.setState({x: hoverInfo.x, y: hoverInfo.y, hoveredObject: hoverInfo.object});
      }
    else {
      console.log("hover - unselected");
      this.setState({x: null, y: null, hoveredObject: null});
    }
  }

  _onViewportChange(viewport) {
    this.setState({
      viewport: {...this.state.viewport, ...viewport}
    });
  }

  componentDidMount() {
    window.addEventListener('resize', this._resize);
    this._resize();
    console.log("componentDidMount (app)");
    this._processData();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._resize);
  }

  _resize() {
    this._onViewportChange({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }

  _processData() {
    let trip = prepareExpeditionData(sftrip);

    if (trip.length > 0) {
      let viewport = {
        ...this.state.viewport,
        ...this._calculateViewportForPoints(trip.map(s => s.coordinates)),
        /*
        transitionDuration: 1000,
        transitionInterpolator: new FlyToInterpolator(),
        transitionEasing: easeCubic*/
      }; 

      console.log("setting state.trip", trip);
      this.setState({viewport, trip});
    }
    else {
      console.log("setting state.trip - with no data");
      this.setState({trip});
    }
  }

  _calculateViewportForPoints(points) {
    const newViewport = new WebMercatorViewport({
      ...this.state.viewport
    });

    let boundingPoints = points.reduce((bounds, point) => {
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
  }
}