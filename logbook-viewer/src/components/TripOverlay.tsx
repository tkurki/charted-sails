import { SKPosition } from '@aldis/strongly-signalk';
import DeckGL, { LineLayer } from 'deck.gl';
import * as React from 'react';
import { SVGOverlay } from 'react-map-gl';
import InteractiveTrip, { InteractiveTripSegment } from '../model/InteractiveTrip';

export interface TripOverlayProps {
  onHover?: (info:any) => void,
  trip: InteractiveTrip,
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

    return ([
      <DeckGL
        key='deckgl-overlay'
        {...this.props.viewport}
        layers={layers}
        onWebGLInitialized={this._initialize}
        pickingRadius={20}
        onLayerHover={ (x : any) => this.props.onHover ? this.props.onHover(x) : false }
       />,
       <SVGOverlay key='svg-overlay-boat' redraw={ (ctx)=>this.redrawBoat(ctx)} />
      ]
    )
  }

  private _initialize(gl : any) {
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
  }

  private redrawBoat(redrawContext:any) {
    const data = this.props.trip.getDataProvider()
    .getValuesAtTime(this.props.trip.getSelection().getCenter())

    if (!('navigation.position' in data)) {
      return <g/>
    }
    const currentPosition = data['navigation.position'] as SKPosition
    let cog = data['navigation.courseOverGround'] as number | undefined
    let hdg = data['navigation.headingMagnetic'] as number | undefined

    let awa = data['environment.wind.angleApparent'] as number|undefined
    let twa = data['environment.wind.angleTrueGround'] as number|undefined

    const pixelCoordinate = redrawContext.project([currentPosition.longitude, currentPosition.latitude])
    if (hdg) {
      hdg = 180 * hdg / Math.PI
    }
    else {
      if (cog) {
        hdg = cog = 180 * cog / Math.PI
      }
      else {
        hdg = cog = 0
      }
    }
    if (awa) {
      awa = 180 * awa / Math.PI
    }
    if (twa) {
      twa = 180 * twa / Math.PI
    }
    const apparentColor = awa && awa > 0 ? 'green' : 'red'
    const trueColor = twa && twa > 0 ? 'green' : 'red'
    return (
      // 200x200 surface with boat centered and wind arrow
      <g transform={ `translate(${pixelCoordinate[0]-100} ${pixelCoordinate[1]-100})`}>
        <marker id="triangle-apparent"
          viewBox="0 0 10 10" refX="0" refY="5"
          markerUnits="strokeWidth"
          markerWidth="4" markerHeight="3"
          orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={ apparentColor }/>
        </marker>
        <marker id="triangle-true"
          viewBox="0 0 10 10" refX="0" refY="5"
          markerUnits="strokeWidth"
          markerWidth="4" markerHeight="3"
          orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={ trueColor }/>
        </marker>
        <g id="boat" transform={`rotate(${cog} 100 100)`} opacity="1">
          { awa &&
          <g id="apparent-wind" transform={`rotate(${awa} 100 100)`} opacity="0.5">
            <line x1="100" y1="0" x2="100" y2="45" markerEnd="url(#triangle-apparent)" stroke={ apparentColor } strokeWidth="6"/>
          </g>
          }
          { twa &&
          <g id="true-wind" transform={`rotate(${twa} 100 100)`}>
            <line x1="100" y1="0" x2="100" y2="45" markerEnd="url(#triangle-true)" stroke={ trueColor } strokeWidth="6"/>
          </g>
          }
          // read right to left: center boat, rotate boat (to normalize), scale, translate back to canvas
          <g transform="translate(100 100) scale(0.5 0.5) rotate(-45) translate(-40 -40) ">
            <path d="M0,56.55
            L14.079,70.635
            L23.438,80
            C56.384,68.35,80,36.943,80,0
            C43.066,0,11.657,23.604,0,56.55z"/>
          </g>
        </g>
      </g>
    )
  }
}