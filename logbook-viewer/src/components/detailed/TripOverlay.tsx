import chroma from 'chroma-js';
import DeckGL, { LineLayer } from 'deck.gl';
import * as React from 'react';
import { SVGOverlay } from 'react-map-gl';
import InteractiveTrip, { InteractiveTripSegment } from '../../model/InteractiveTrip';
import { DynamicBoatSVG } from './DynamicBoatSVG';

export interface TripOverlayProps {
  onHover?: (info:any) => void,
  trip: InteractiveTrip,
  viewport: any
  coloringMode: 'solid' | 'selection' | 'gradient'
  trackColor: [number, number, number] | [number, number, number, number]
  selectionStart?: Date
  selectionEnd?: Date
}

export default class TripOverlay extends React.Component<TripOverlayProps> {
  private gradientColor: chroma.Scale

  constructor(props : TripOverlayProps) {
    super(props)
    this.segmentColorPerSelection = this.segmentColorPerSelection.bind(this)
    this.segmentColorPerGradient = this.segmentColorPerGradient.bind(this)
    // Domain                              0kts       1kt        3kt     6kt        10kt       15kt       20kt       40kt
    // Blueprintjs colors:            @dark-gray1   @blue1     @green1  @red1      @violet1    @turquoise1 @lime1     @gold1
    this.gradientColor = chroma.scale(["#182026", "#0E5A8A", "#0A6640", "#A82A2A", "#5C255C", "#008075", "#728C23", "#A67908"])
                               .domain([0,             1,         3,       6,         10,       15,        20,        40].map(x=>x*1852/3600))
  }

  public render() {
    if (!this.props.trip) {
      return null;
    }

    const layers = [
      new LineLayer({
        data: this.props.trip.getPathSegments(),
        getColor: this.props.coloringMode === 'solid' ? this.props.trackColor :
          (this.props.coloringMode === 'selection' ? this.segmentColorPerSelection : this.segmentColorPerGradient),
        getStrokeWidth: 5,
        getSourcePosition: (segment : InteractiveTripSegment) => segment.startPosition.asArray(),
        getTargetPosition: (segment : InteractiveTripSegment) => segment.endPosition.asArray(),
        id: 'line-layer',
        pickable: true,
        updateTriggers: {
          getColor: [this.props.coloringMode, this.props.trackColor, this.props.selectionStart, this.props.selectionEnd]
      }
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
    const boatData = this.props.trip.getDataProvider()
      .getValuesAtTime(this.props.trip.getSelection().getCenter())
    return <DynamicBoatSVG data={boatData} project={redrawContext.project} />
  }

  private segmentColorPerSelection(segment: InteractiveTripSegment) {
    if ((this.props.selectionStart && segment.startTime >= this.props.selectionStart) &&
        (this.props.selectionEnd && segment.endTime <= this.props.selectionEnd)) {
      return this.props.trackColor
    }
    else {
      return [223, 226, 229]
    }
  }

  private segmentColorPerGradient(segment: InteractiveTripSegment) {
    if (segment.speed !== undefined) {
      const color = this.gradientColor(segment.speed)
      return color.rgb()
    }
    else {
      return [223, 226, 229]
    }
  }
}