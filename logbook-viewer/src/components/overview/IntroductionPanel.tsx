import * as React from 'react';
import Dropzone from 'react-dropzone';
import aldisLogo from '../../aldis-logo.png';
import './IntroductionPanel.css';

export interface IntroductionPanelProps {
  style?: React.CSSProperties
  onFileSelected: (file:File) => void
}

export class IntroductionPanel extends React.Component<IntroductionPanelProps> {
  public render() {
    return (
      <div className="pt-card pt-elevation-2 intro-panel" style={ this.props.style }>
        <div className='intro-logo'>
          <img src={ aldisLogo }/>
        </div>
        <div className='intro-text'>
          <h3>Welcome to Charted!</h3>
          <p>
            To begin, select a trip on the map or drag and drop one of your log files <strong>here</strong>.
          </p>
          <div className="dropzone">
            <Dropzone onDrop={this.onDrop.bind(this)}>
             <p>Try dropping some files here, or click to select files to upload.</p>
            </Dropzone>
           </div>

          <p>
            We currently only support Expedition log files in CSV format but we are quickly adding more formats.
            You can help by sending us your logs! Email them to <a href="mailto:hello@aldislab.com">hello@aldislab.com</a>.
          </p>

        </div>
      </div>
    )
  }

  private onDrop(files: File[]) {
    if (files.length !== 1) {
      console.log(`Interesting, user dropped ${files.length} files.`)
    }
    this.props.onFileSelected(files[0])
  }
}