import React, {Component} from 'react';
import MapGL from 'react-map-gl';
import pick from 'object.pick';

import DeckGLOverlay from './deckgl-overlay'

import sftrip from '../data/expedition-sanfrancisco.csv';

const MAPBOX_STYLE = 'mapbox://styles/mapbox/dark-v9';
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
        longitude: -122.4,
        latitude: 37.8,
        zoom: 11,
        maxZoom: 16
      },
      segments: []
    };
    this._resize = this._resize.bind(this);
  }

  render() {
    return (
      <div>
        <MapGL
          {...this.state.viewport}
          mapStyle={MAPBOX_STYLE}
          mapboxApiAccessToken={MAPBOX_TOKEN} 
          onViewportChange={viewport => this._onViewportChange(viewport)}
        >
          <DeckGLOverlay
            viewport={this.state.viewport}
            data={this.state.segments}
          />
        </MapGL>
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

    let segments = [];
    sftrip.forEach(line => {
      let segment = pick(line, ['Bsp', 'Awa', 'Aws', 'Twa', 'Tws']);
      segment['time'] = new Date(new Date("1900-01-01T00:00:00Z").getTime() + line['Utc'] * 24 * 3600 * 1000);
      segment.fromPosition = currentPosition;

      if (line['Lon'] !== null && line['Lat'] !== null) {
        segment.toPosition = [Number(line['Lon']), Number(line['Lat'])];
        if (currentPosition != null) {
          segments.push(segment);
        }
  
        currentPosition = segment.toPosition;
      }
    });

    segments = segments.slice(1);
    this.setState({ segments });
    console.log(sftrip);
    console.log(segments);
  }
}