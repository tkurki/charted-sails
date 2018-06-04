import React, {Component} from 'react';
import DeckGL, {LineLayer, ScatterplotLayer, PathLayer} from 'deck.gl';

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
    console.log(this.props.data);
    
    const layers = [
      new PathLayer({
        id: 'path-layer',
        data: this.props.data,
        pickable: true,
        widthScale: 2,
        widthMinPixels: 2,
        getPath: d => d.path,
        getColor: d => [30, 150, 100],
        getWidth: d => 5
      })
    ];

    return (
      <DeckGL {...this.props.viewport} layers={layers} onWebGLInitialized={this._initialize} />
    )
  }
}