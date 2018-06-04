import React, {Component} from 'react';
import DeckGL, {LineLayer, ScatterplotLayer} from 'deck.gl';

export default class DeckGLOverlay extends Component {
  _initialize(gl) {
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
  }

  render() {
    if (!this.props.data) {
      return null;
    }

    console.log(`will render ${this.props.data.length} segments`)
    
    const layers = [
      new LineLayer({
        id: 'line-layer',
        data: this.props.data,
        pickable: true,
        getSourcePosition: d => { /*console.log(d);*/ return d.fromPosition; },
        getTargetPosition: d => d.toPosition,
        getColor: d => [30, 150, 100],
        getStrokeWidth: 12,
        ...this.props
      })/*,
      new ScatterplotLayer({
        id: 'scatterplot',
        getPosition: d=>d.toPosition,
        getColor: d => [0, 128, 255],
        getRadius: d => 5,
        opacity: 0.5,
        pickable: false,
        radiusScale: 5,
        radiusMinPixels: 0.25,
        radiusMaxPixels: 30,
        ...this.props
      })*/
    ];

    return (
      <DeckGL {...this.props.viewport} layers={layers} onWebGLInitialized={this._initialize} />
    )
  }
}