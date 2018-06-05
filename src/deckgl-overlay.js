import React, {Component} from 'react';
import DeckGL, {LineLayer, ScatterplotLayer, PathLayer} from 'deck.gl';

export default class DeckGLOverlay extends Component {
  _initialize(gl) {
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
  }

  render() {
    if (!this.props.data) {
      console.log("DeckGLOverlay has no data to render");
      return null;
    }

    const layers = [
      new LineLayer({
        id: 'line-layer',
        data: this.props.data.slice(1),
        pickable: true,
        getStrokeWidth: 5,
        getSourcePosition: segment => segment.previousCoordinates,
        getTargetPosition: segment => segment.coordinates,
        getColor: d => [30, 150, 100],
        /* onHover: h => this.props.onHover(h),*/
        autoHighlight: true,
        highlightColor: [200, 150, 100, 200]
      })
    ];

    return (
      <DeckGL 
        {...this.props.viewport} 
        layers={layers} 
        onWebGLInitialized={this._initialize} 
        pickingRadius={20} 
        onLayerHover={ x => this.props.onHover(x) }/>
    )
  }
}