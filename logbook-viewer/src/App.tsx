import { SKPosition } from '@aldis/strongly-signalk';
import { Button, ButtonGroup, Intent, ProgressBar } from '@blueprintjs/core';
import { User } from 'firebase';
import queryString from 'query-string';
import * as React from 'react';
import ReactGA from 'react-ga';
import ReactMapGL from 'react-map-gl';
import WebMercatorViewport from 'viewport-mercator-project';
import './App.css';
import { AppToaster } from './AppToaster';
import { auth } from './backend/firebase';
import UserButton from './components/auth/UserButton';
import DataPanel from './components/detailed/DataPanel';
import DataTable from './components/detailed/DataTable';
import TimePanel from './components/detailed/TimePanel';
import TripOverlay from './components/detailed/TripOverlay';
import { IntroductionPanel } from './components/overview/IntroductionPanel';
import TripSelectorOverlay from './components/overview/TripSelectorOverlay';
import InteractiveTrip from './model/InteractiveTrip';
import TimeSelection from './model/TimeSelection';
import { TripOverview } from './model/TripOverview';
import LogParser, { LogParserOutput } from './parsing/LogParser';
import { sampleDataTripOverviews } from './sample-data/SampleData';


const MAPBOX_STYLE_SATELLITE = 'mapbox://styles/mapbox/satellite-v9'
const MAPBOX_STYLE_MAP = 'mapbox://styles/mapbox/light-v9';
const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN
const GA_TRACKING_CODE = process.env.REACT_APP_GA_TRACKING_CODE

if (!MAPBOX_TOKEN) {
  alert('The mapbox token is not defined. Set a MAPBOX_TOKEN environment variable.');
}

// tslint:disable-next-line:no-empty-interface
export interface AppProps {
}

export interface AppState {
  viewport : any
  trip: InteractiveTrip|null,
  hoveredObject?: any

  /* Modes */
  showDataTable: boolean
  editing: boolean
  satelliteView: boolean

  /* Playback info */
  playbackSpeed: number
  playbackAnimationReference: [Date,Date] | null

  /* When editing track bounds */
  newStartBoundTime?: Date
  newEndBoundTime?: Date

  /* User state */
  user: null | User
}

export default class App extends React.Component<AppProps, AppState> {
  constructor(props : AppProps) {
    super(props);

    this.state = {
      trip: null,
      viewport: {
        height: window.innerHeight,
        width: window.innerWidth,
        longitude: 0,
        latitude: 0,
        zoom: 0,
        maxZoom: 32
      },
      showDataTable: false,
      editing: false,
      satelliteView: false,
      playbackSpeed: 0,
      playbackAnimationReference: null,
      user: null
    }
    this._resize = this._resize.bind(this);
    this.setSelection = this.setSelection.bind(this)
  }

  public render() {
    return (
      <div>
        <ReactMapGL
          {...this.state.viewport}
          mapStyle={this.state.satelliteView ? MAPBOX_STYLE_SATELLITE : MAPBOX_STYLE_MAP }
          mapboxApiAccessToken={MAPBOX_TOKEN}
          onViewportChange={viewport => this._onViewportChange(viewport)}
        >
          {this.state.trip &&
            <TripOverlay
              viewport={this.state.viewport}
              trip={this.state.trip}
              onHover={(hover : any) => this._onHover(hover)}
              coloringMode={ this.state.editing ? 'selection' : 'gradient'} trackColor={[53, 123, 184]}
              selectionStart={this.state.newStartBoundTime} selectionEnd={this.state.newEndBoundTime}
            />
          }
          {!this.state.trip &&
            <TripSelectorOverlay
              tripOverviews={sampleDataTripOverviews}
              viewport={this.state.viewport}
              onTripOverviewSelected={x => this.tripOverviewSelected(x) }
            />
          }
        </ReactMapGL>

        <ButtonGroup large={true} className='buttonGroupBar'>
          {this.state.trip && (
            <React.Fragment>
              <Button icon="satellite" active={ this.state.satelliteView } onClick={ () => {
                ReactGA.event({ category: 'ButtonGroup', action: `Satellite ${ this.state.satelliteView ? 'Off' : 'On' }`})
                this.setState({ satelliteView: !this.state.satelliteView })
              }} />
              <Button icon="annotation" active={ this.state.editing } onClick={ () => {
                ReactGA.event({ category: 'ButtonGroup', action: `Edit ${ this.state.editing ? 'End' : 'Start' }`})
                if (this.state.editing) {
                  this.endEditing()
                }
                else {
                  this.startEditing()
                }
                this.setState({ editing: !this.state.editing })
              }} />
              <Button icon="th" active={ this.state.showDataTable } onClick={ () => {
                ReactGA.event({ category: 'ButtonGroup', action: `${ this.state.showDataTable ? 'Close ' : 'Open '} Table `})
                this.setState({ showDataTable: !this.state.showDataTable })
              }
              }/>
              <Button icon="cross" onClick={ () => this.onCloseTrip() }/>
            </React.Fragment>
          )}
          <UserButton style={ { position: 'absolute', top: '50px', right: '50px' }  }
            onLoginWithEmailAndPassword={ (username, password) => {
              return auth.signInAndRetrieveDataWithEmailAndPassword(username, password)
                .then((userCredential) => {
                  if (userCredential.user != null) {
                    this.setState({ user: userCredential.user })
                    return userCredential.user.sendEmailVerification()
                  }
                  else {
                    throw new Error('Unknown error (should not happen).')
                  }
                })
            }}
            onCreateAccountWithEmailAndPassword={ (username, password) => {
              return auth.createUserWithEmailAndPassword(username, password)
                .then((userCredential) => {
                  if (userCredential.user != null) {
                    this.setState({ user: userCredential.user })
                  }
                  else {
                    throw new Error('Unknown error (should not happen).')
                  }
                })
            }}
            onLogout={ () => {
              return auth.signOut()
            } }
            userInfo={ this.state.user ? this.state.user : null }/>
        </ButtonGroup>

        {this.state.trip && (
          <React.Fragment>
            <DataPanel
              dataProvider={ this.state.trip.getDataProvider() }
              hoveringMode={ this.state.hoveredObject ? true : false }
              selection={ this.state.trip.getSelection() }
              style={ { position: 'absolute', top: '20px', left: '20px' } }/>
            <TimePanel
              endTime={ this.state.trip.getEndTime() }
              startTime={ this.state.trip.getStartTime() }
              // FIXME: Need a better way to initialize selectedSegment! This should never be null when we have a trip.
              selectedTime={ this.state.trip.getSelection().getCenter() }
              onSelectedTimeChange={ t => this._onSelectedTimeChange(t) }
              playSpeed={this.state.playbackSpeed} onPlaySpeedChange={(speed) => this.setPlaybackSpeed(speed)}
              editableBounds={ this.state.editing }
              startBoundTime={ this.state.newStartBoundTime }
              endBoundTime={ this.state.newEndBoundTime }
              onBoundsChanged={ (start, end) => { this.setState({ newStartBoundTime: start, newEndBoundTime: end } ) }}
              style={ {
                position: 'absolute',
                left: "50%",
                bottom: "20px",
                transform: "translate(-50%, 0)",
                width: '75%'
              } }
            />
            { this.state.showDataTable &&
              <div className="bp3-dialog-container" style={ { position: 'absolute', top: '0px', left: '0px', width: '100%', height: '100%' } }>
                <div className="bp3-dialog" style={ { width: '75%', height: '80%' } }>
                  <div className="bp3-dialog-header">
                    <span className="bp3-icon-large bp3-icon-th"/>
                    <h4 className="bp3-heading">{ this.state.trip.getTitle() }</h4>
                    <button aria-label="Close" className="bp3-dialog-close-button bp3-icon-small-cross"
                      onClick={ () => this.setState({ showDataTable: false }) }/>
                  </div>
                  <div className="bp3-dialog-body" style={ { height: '80%' } }>
                    <DataTable
                      dataProvider={this.state.trip.getDataProvider()}
                      selection={this.state.trip.getSelection()}
                      onSelectionChange={ this.setSelection }
                    />
                  </div>
                </div>
              </div>
            }
          </React.Fragment>
          )
        }
        {!this.state.trip &&
        <React.Fragment>
          <IntroductionPanel
          onFileSelected={ (f:File) => this.openFile(f) }
          style={ {
            position: 'absolute',
            left: "50%",
            bottom: "20px",
            transform: "translate(-50%, 0)",
            width: '75%',
          } } />
        </React.Fragment>
        }
      </div>
    );
  }

  public _onHover(hoverInfo : any) {
    if (hoverInfo) {
      this.setState({hoveredObject: hoverInfo.object});
      }
    else {
      this.setState({hoveredObject: null});
    }
  }

  public _onViewportChange(viewport : any) {
    this.setState({
      viewport: {...this.state.viewport, ...viewport}
    });
  }

  public componentDidMount() {
    if (process.env.NODE_ENV === 'production' && GA_TRACKING_CODE) {
      ReactGA.initialize(GA_TRACKING_CODE);
    }
    else {
      ReactGA.initialize(GA_TRACKING_CODE || '', { testMode: true });
    }
    ReactGA.pageview(window.location.pathname + window.location.search);

    auth.onAuthStateChanged((user) => {
      this.setState({ user })
    })

    window.addEventListener('resize', this._resize);
    this._resize();
    this.animateMapToShowTripOverviews()

    const parsed = queryString.parse(location.search)
    if (parsed.url !== undefined) {
      this.openURL(parsed.url)
    }
  }

  public componentWillUnmount() {
    window.removeEventListener('resize', this._resize);
  }

  public _resize() {
    this.setState({
      viewport: {
        ...this.state.viewport,
        width: window.innerWidth,
        height: window.innerHeight
      }
    });
  }

  private openFile(f: File) {
    ReactGA.event({ category: 'Trip', action: 'Load file', label: f.name })

    this.openLogParserPromise(new LogParser().openFile(f), `file-upload://${f.name}`)
  }

  private openURL(url: string) {
    ReactGA.event({ category: 'Trip', action: 'Load url', label: url })

    this.openLogParserPromise(new LogParser().openURL(url), url)
  }

  private openLogParserPromise(promise: Promise<LogParserOutput>, label: string) {
    const loadingToastKey = AppToaster.show({
      icon: "cloud-upload",
      timeout: 0,
      message: <ProgressBar intent='primary' className='toasted-progress-bar'/>
    })

    promise.then(({trip, timeSpent}) => {
      this.showTrip(trip)
      AppToaster.dismiss(loadingToastKey)
      if (timeSpent !== undefined) {
        ReactGA.timing({ category: 'Trip', variable: 'openTrip', value: timeSpent })
      }
    })
    .catch((e : Error) => {
      AppToaster.dismiss(loadingToastKey)
      console.log(`Unable to load ${label}: ${e.message}`)
      ReactGA.event({ category: 'Trip', action: 'ParsingError', label: `${label}: ${e.message}` })
      this.setState({trip: null})

      const mailBody = `Hey,\nI ran into a problem with charted sails loading this:\nURL: ${label}\nError: ${e.message}`
      const mailto = `mailto:hello@aldislab.com?subject=${encodeURIComponent('Unable to load trip')}&amp;`
       + `body=${ encodeURIComponent(mailBody) }`

      AppToaster.show({
        icon: 'warning-sign',
        intent: Intent.DANGER,
        message: <div>We were unable to open this trip.&nbsp;
          <a href={mailto}>Please let us know about this</a>.<br/>
          <small>Error: {e.message}</small>
        </div>
      })
    })
  }

  private tripOverviewSelected(t: TripOverview) {
    ReactGA.event({ category: 'Trip', action: 'Load trip', label: t.label })
    this.openURL(t.url)
  }

  private showTrip(trip: InteractiveTrip) {
    const viewport = {
      ...this.state.viewport,
      ...this._calculateViewportBounding(trip.getBounds()),
      // transitionDuration: 3000,
      // transitionInterpolator: new FlyToInterpolator(),
      /*transitionEasing: easeCubic*/
    }
    this.setState({viewport, trip})
  }

  private animateMapToShowTripOverviews() {
    this.setState({
      viewport: {
        ...this.state.viewport,
        longitude: sampleDataTripOverviews[0].path[0][0],
        latitude: sampleDataTripOverviews[0].path[0][1],
        zoom: 1 // ,
        // transitionInterpolator: new FlyToInterpolator(),
        // transitionDuration: 3000
      }
    })
  }

  private onCloseTrip() {
    ReactGA.event({ category: 'Trip', action: 'Close Trip' })

    this.setState({trip: null, satelliteView: false, editing: false, showDataTable: false})
    setImmediate(() => {
      this.animateMapToShowTripOverviews()
    })
  }

  private _calculateViewportBounding(boundingPositions: [SKPosition, SKPosition]) {
    const newViewport = new WebMercatorViewport({
      ...this.state.viewport
    });

    const bounds = newViewport.fitBounds(
      [boundingPositions[0].asArray(), boundingPositions[1].asArray()],
      {padding: {left: 230 + 20, top: 20, bottom: 20, right: 20}}
    );
    return bounds;
  }

  /**
   * Called when the user has selected a new time by dragging the time slider.
   * @param t new time selected
   */
  private _onSelectedTimeChange(t : Date) {
    this.setSelection(new TimeSelection(t))
  }

  private setSelection(s: TimeSelection) {
    if (this.state.trip) {
      // FIXME: State should be immutable!
      this.state.trip.setSelection(s)
      this.setState({trip: this.state.trip})

      // Reset animation reference if we are in playback mode.
      if (this.state.playbackSpeed > 0) {
        this.setState({ playbackAnimationReference: [new Date(), this.state.trip.getSelection().getCenter() ] })
      }
    }
  }

  private startEditing() {
    if (this.state.trip) {
      this.setState({
        newStartBoundTime: this.state.trip.getStartTime(),
        newEndBoundTime: this.state.trip.getEndTime(),
        playbackSpeed: 0
       })
    }
  }

  private endEditing() {
    if (this.state.trip) {
      if (this.state.newStartBoundTime && this.state.newEndBoundTime) {
        // FIXME: State should be immutable!
        this.state.trip.trimBounds(this.state.newStartBoundTime, this.state.newEndBoundTime)
      }
      this.setState({ trip: this.state.trip })
    }
  }

  private setPlaybackSpeed(speed: number) {
    if (this.state.trip && speed > 0) {
      requestAnimationFrame(() => this.animatePlayback() )
      this.setState({ playbackAnimationReference: [new Date(), this.state.trip.getSelection().getCenter() ], playbackSpeed: speed })
    }
    else {
      this.setState({ playbackAnimationReference: null, playbackSpeed: speed })
    }
  }

  private animatePlayback() {
    if (this.state.playbackSpeed > 0 && this.state.trip && this.state.playbackAnimationReference) {
      const [referenceRealtime, referenceSelection] = this.state.playbackAnimationReference
      let newTime = new Date(referenceSelection.getTime() + (Date.now() - referenceRealtime.getTime()) * this.state.playbackSpeed)

      if (newTime > this.state.trip.getEndTime()) {
        newTime = this.state.trip.getEndTime()
        this.setState({ playbackSpeed: 0 })
      }

      this.state.trip.setSelection(new TimeSelection(newTime))
      this.setState({
        trip: this.state.trip
      })
      requestAnimationFrame( () => this.animatePlayback() )
    }
  }
}