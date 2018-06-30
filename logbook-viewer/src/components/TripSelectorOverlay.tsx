import DeckGL, { PathLayer } from 'deck.gl';
import * as React from 'react';
import { Marker } from 'react-map-gl';
import { TripOverview } from '../model/TripOverview';
import { TripOverviewView } from './TripOverviewView';

export interface TripSelectorOverlayProps {
  viewport: any
  tripOverviews: TripOverview[]
  onTripOverviewSelected: (t: TripOverview) => void
}

export default class TripSelectorOverlay extends React.Component<TripSelectorOverlayProps> {
  public render() {
    const layers = [
      new PathLayer({
        autoHighlight: true,
        data: this.props.tripOverviews,
        pickable: true,
        widthScale: 20,
        widthMinPixels: 3,
        getPath: (d:TripOverview) => d.path,
        getColor: () => [30, 150, 100],
        highlightColor: [200, 150, 100, 200],
        id: 'path-layer'
      })
    ];

    const markers = this.props.tripOverviews.map((trip, index) => (
      // FIXME: If we ever change the list of tripOverviews dynamically we should use a real key and not the index!
      <Marker longitude={trip.path[0][0]} latitude={trip.path[0][1]}>
        <TripOverviewView tripOverview={trip} onTripOverviewSelected={this.props.onTripOverviewSelected} />
      </Marker>
    ))

    return [
      <DeckGL
        key='deck'
        {...this.props.viewport}
        layers={layers}
        onWebGLInitialized={this._initialize}
        pickingRadius={20}
        onLayerClick={ (x: any) => x !== null && this.props.onTripOverviewSelected(x.object) }
        /*
        onLayerHover={ (x : any) => this.props.onHover ? this.props.onHover(x) : false }
        */
       />,
       markers]
  }

  private _initialize(gl : any) {
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
  }
}