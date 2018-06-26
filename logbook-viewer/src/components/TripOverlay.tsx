import DeckGL, { LineLayer } from 'deck.gl';
import * as React from 'react';
import InteractiveTrip, { InteractiveTripSegment } from '../model/InteractiveTrip';

export interface TripOverlayProps {
  onHover?: (info:any) => void,
  trip?: InteractiveTrip,
  viewport: any
}

export default class TripOverlay extends React.Component<TripOverlayProps> {
  public render() {
    if (!this.props.trip) {
      return null;
    }

    const layers = [
      new LineLayer({
        autoHighlight: true,
        data: this.props.trip.getPathSegments(),
        getColor: () => [30, 150, 100],
        getSourcePosition: (segment : InteractiveTripSegment) => segment.startPosition.asArray(),
        getStrokeWidth: 5,
        getTargetPosition: (segment : InteractiveTripSegment) => segment.endPosition.asArray(),
        highlightColor: [200, 150, 100, 200],
        id: 'line-layer',
        pickable: true
      })
    ];

    return (
      <DeckGL
        {...this.props.viewport}
        layers={layers}
        onWebGLInitialized={this._initialize}
        pickingRadius={20}
        onLayerHover={ (x : any) => this.props.onHover ? this.props.onHover(x) : false }
       />
    )
  }

  private _initialize(gl : any) {
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
  }
}