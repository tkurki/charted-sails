import { BetterDataProvider, SKPosition } from '@aldis/strongly-signalk';
import * as React from 'react';
import ReactMapGL, { FlyToInterpolator } from 'react-map-gl';
import WebMercatorViewport from 'viewport-mercator-project';
import aldisLogo from './aldis-logo.png';
import './App.css';
import DataPanel from './components/DataPanel';
import MyMapControls from './components/MyMapControls';
import TimePanel from './components/TimePanel';
import TripOverlay from './components/TripOverlay';
import TripSelectorOverlay from './components/TripSelectorOverlay';
import InteractiveTrip from './model/InteractiveTrip';
import TimeSelection from './model/TimeSelection';
import { TripOverview } from './model/TripOverview';
import { sampleDataTripOverviews } from './sample-data/SampleData';



const MAPBOX_STYLE = 'mapbox://styles/mapbox/light-v9';
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
  private mapControls = new MyMapControls()

  constructor(props : AppProps) {
    super(props);

    this.state = {
      trip: null,
      viewport: {
        height: window.innerHeight,
        width: window.innerWidth,
        longitude: 0,
        latitude: 0,
        zoom: 0,
        maxZoom: 32
      }
    }
    this._resize = this._resize.bind(this);

    this.mapControls.setOptions({ onUserInteraction: () => {
        this.setState({})
      }
    })
  }

  public render() {
    return (
      <div>
        <img className="aldisLogo" src={aldisLogo} />

        {this.state.trip &&
          <button type="button" className="pt-button pt-minimal pt-icon-cross close-button"
            onClick={ () => this.onCloseTrip() } />
        }
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
              trip={this.state.trip}
              onHover={(hover : any) => this._onHover(hover)}
            />
          }
          {!this.state.trip &&
            <TripSelectorOverlay
              tripOverviews={sampleDataTripOverviews}
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
      const provider = new CachingDataProvider(new SKDeltaDataProvider(delta), 1000)
      //const provider = new BetterDataProvider(delta)
      const trip = new InteractiveTrip(delta, provider)

      // Initialize the cache.
      for (let i = trip.getStartTime().getTime(); i < trip.getStartTime().getTime() + 1000*60*3; i += 1000) {
        const d = new Date(i)
        console.log(`${new Date()} => ${d}`)
        provider.getValuesAtTime(d)
      }

      const viewport = {
        ...this.state.viewport,
        ...this._calculateViewportBounding(trip.getBounds()),
        transitionDuration: 3000,
        transitionInterpolator: new FlyToInterpolator(),
        /*transitionEasing: easeCubic*/
      }
      this.setState({viewport, trip})
    })
    .catch(error => {
      console.log("Unable to load trip", error)
      this.setState({trip: null})
    })
    console.log(`Trip selected: ${t}`)
  }

  private animateMap() {
    this.setState({
      viewport: {
        ...this.state.viewport,
        longitude: sampleDataTripOverviews[0].path[0][0],
        latitude: sampleDataTripOverviews[0].path[0][1],
        zoom: 1,
        transitionInterpolator: new FlyToInterpolator(),
        transitionDuration: 3000
      }
    })
  }

  private onCloseTrip() {
    this.setState({trip: null})
    setImmediate(() => {
      this.animateMap()
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