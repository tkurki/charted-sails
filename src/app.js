import React, {Component} from 'react';
import ReactMapGL, {LinearInterpolator, FlyToInterpolator} from 'react-map-gl';
// 3rd-party easing functions
import d3, {easeCubic} from 'd3-ease';
import pick from 'object.pick';

import DeckGLOverlay from './deckgl-overlay'
import WebMercatorViewport from 'viewport-mercator-project';

import sftrip from '../data/expedition-sanfrancisco.csv';

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
      points: []
    };
    this._resize = this._resize.bind(this);
  }

  render() {
    return (
      <div>
        <ReactMapGL
          {...this.state.viewport}
          mapStyle={MAPBOX_STYLE}
          mapboxApiAccessToken={MAPBOX_TOKEN} 
          onViewportChange={viewport => this._onViewportChange(viewport)}
        >
          <DeckGLOverlay
            viewport={this.state.viewport}
            data={ this.state.points.length > 0 ? [ {path:this.state.points} ] : [] }
          />
        </ReactMapGL>
      </div>
    );
  }
  _onViewportChange(viewport) {
    this.setState({
      viewport: {...this.state.viewport, ...viewport}
    });
  }

  componentDidMount() {
    window.addEventListener('resize', this._resize);
    this._resize();
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
    let currentPosition = null;

    let points = [];
    sftrip.forEach(line => {
      if (line['Lon'] !== null && line['Lat'] !== null) {
        points.push([ Number(line['Lon']), Number(line['Lat']) ]);
      }
    });

    if (points.length > 0) {
      let viewport = {
        ...this.state.viewport,
        ...this._calculateViewportForPoints(points),
        transitionDuration: 1000,
        transitionInterpolator: new FlyToInterpolator(),
        transitionEasing: easeCubic
      }; 

      this.setState({viewport, points});
    }
    else {
      this.setState({points});
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
      {padding: 20, offset: [0, 0]}
    );
    return bounds;
  }
  /*
      let segment = pick(line, ['Bsp', 'Awa', 'Aws', 'Twa', 'Tws']);
      segment['time'] = new Date(new Date("1900-01-01T00:00:00Z").getTime() + line['Utc'] * 24 * 3600 * 1000);
      segment.fromPosition = currentPosition;

      if (line['Lon'] !== null && line['Lat'] !== null) {
        segment.toPosition = 
        if (currentPosition != null) {
          segments.push(segment);
          points.push([segment.toPosition[0], segment.toPosition[1]]);
        }
  
        currentPosition = segment.toPosition;
      }
    });

    segments = segments.slice(1);
*/
}