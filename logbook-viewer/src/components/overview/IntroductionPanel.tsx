import * as React from 'react';
import aldisLogo from '../../aldis-logo.png';
import './IntroductionPanel.css';

/* tslint:disable-next-line */
let Dropzone = require('react-dropzone')
if ('default' in Dropzone) {
  Dropzone = Dropzone.default
}

export interface IntroductionPanelProps {
  style?: React.CSSProperties
  onFileSelected: (file:File) => void
}

export class IntroductionPanel extends React.Component<IntroductionPanelProps> {
  private onDrop: (acceptedFiles: File[])=>void

  constructor(props:IntroductionPanelProps) {
    super(props)
    this.onDrop = this._onDrop.bind(this)
  }

  public render() {
    return (
      <div className="pt-card pt-elevation-2 intro-panel" style={ this.props.style }>
        <div className='intro-logo'>
          <img src={ aldisLogo }/>
        </div>
        <div className='intro-text'>
          <h3>Welcome to Charted Sails!</h3>
          <p>
            To begin, select a trip on the map or drag and drop one of your own log files.
          </p>
          <Dropzone onDrop={ this.onDrop } className='dropzone'
            acceptClassName='dropzoneAccept' rejectClassName='dropzoneReject' >
            <p>Try dropping some files here, or click to select files to upload.</p>
          </Dropzone>

          <p>
            We currently only support Expedition log files in CSV format but we are quickly adding more formats.
            You can help by sending us your logs! Email them to <a href="mailto:hello@aldislab.com">hello@aldislab.com</a>.
          </p>

        </div>
      </div>
    )
  }

  private _onDrop(files: File[]) {
    if (files.length !== 1) {
      console.log(`Interesting, user dropped ${files.length} files.`)
    }
    this.props.onFileSelected(files[0])
  }
}