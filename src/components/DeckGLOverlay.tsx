import DeckGL, { LineLayer } from 'deck.gl';
import * as React from 'react';
import Trip, { Segment } from '../model/Trip';

export interface DeckGLOverlayProps {
  onHover?: (info:any) => void,
  trip?: Trip,
  viewport: any
}

export default class DeckGLOverlay extends React.Component<DeckGLOverlayProps> {
  public render() {
    if (!this.props.trip) {
      return null;
    }

    const layers = [
      new LineLayer({
        autoHighlight: true,
        data: this.props.trip.segments.slice(1),
        getColor: () => [30, 150, 100],
        getSourcePosition: (segment : Segment) => segment.start.coordinates,
        getStrokeWidth: 5,
        getTargetPosition: (segment : Segment) => segment.end.coordinates,
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