import { SKPosition, SKValueType } from '@aldis/strongly-signalk';
import * as React from 'react';

export interface DynamicBoatSVGProps {
  data: {[path:string]: SKValueType}
  project: ([lat,lon]:[number,number]) => [number,number]
}

/**
 * Returns SVG elements for a 200x200 surface with the boat centered at 100x100
 * and wind arrows (if data available).
 * @param param
 */
export function DynamicBoatSVG({data, project}:DynamicBoatSVGProps) {
  if (!('navigation.position' in data)) {
    return <g/>
  }
  const currentPosition = data['navigation.position'] as SKPosition

  // FIXME: We should correct for magnetic variation before using magnetic values.
  const cogm = data['navigation.courseOverGround'] as number | undefined
  const cogt = data['navigation.courseOverGroundTrue'] as number | undefined
  let cog = cogt !== undefined ? cogt : cogm

  const hdgt = data['navigation.headingTrue'] as number | undefined
  const hdgm = data['navigation.headingMagnetic'] as number | undefined
  let hdg = hdgt !== undefined ? hdgt : hdgm

  let awa = data['environment.wind.angleApparent'] as number|undefined
  let twa = data['environment.wind.angleTrueWater'] as number|undefined
  if (twa === undefined) {
    twa = data['environment.wind.angleTrueGround'] as number|undefined
  }

  const pixelCoordinate = project([currentPosition.longitude, currentPosition.latitude])
  if (hdg !== undefined) {
    hdg = 180 * hdg / Math.PI
  }
  if (cog !== undefined) {
    cog = 180 * cog / Math.PI
  }

  if (hdg === undefined) {
    hdg = cog
  }

  if (awa !== undefined) {
    awa = 180 * awa / Math.PI
  }
  if (twa !== undefined) {
    twa = 180 * twa / Math.PI
  }
  // blueprint js colors: green1/green3 red1/red3
  const apparentColor = awa && awa > 0 ? '#0F9960' : '#A82A2A'
  const trueColor = twa && twa > 0 ? '#3DCC91' : '#DB3737'
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
      // COG Vector
      { cog!==undefined &&
        <g transform={`rotate(${cog} 100 100)`}>
          <line x1="100" y1="100" x2="100" y2="50" stroke='black' strokeWidth="2"/>
        </g>
      }
      <g id="boat" transform={`rotate(${hdg !== undefined ? hdg : 0} 100 100)`} opacity="1">
        { awa!==undefined &&
        <g id="apparent-wind" transform={`rotate(${awa} 100 100)`} opacity="0.5">
          <line x1="100" y1="0" x2="100" y2="45" markerEnd="url(#triangle-apparent)" stroke={ apparentColor } strokeWidth="6"/>
        </g>
        }
        { twa!==undefined &&
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