import { Button, Callout, Classes, Dialog, FormGroup, InputGroup, Intent, Spinner, Tab, Tabs } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';
import './LoginDialog.css';

interface LoginDialogProps {
  isOpen: boolean
  onLoginWithEmailAndPassword: (username: string, password: string) => Promise<void>
  onLoginWithFacebook?: () => Promise<void>
  onCreateAccountWithEmailAndPassword: (username: string, password: string) => Promise<void>
  onDismiss: () => void
}

interface LoginDialogState {
  username: string
  password: string
  loading: boolean
  selectedProvider: 'email' | 'facebook'
  errorMessage: string | null
}

export default class LoginDialog extends React.Component<LoginDialogProps, LoginDialogState> {
  constructor(props: LoginDialogProps) {
    super(props)

    this.state = {
      username: '',
      password: '',
      selectedProvider: "email",
      loading: false,
      errorMessage: null
    }
  }

  public render() {
    if (this.state.loading) {
      return (
        <Dialog isOpen={true}>
          <div className={Classes.DIALOG_BODY}>
            <div style={ {textAlign: 'center'} }>
              <Spinner />
            </div>
          </div>
        </Dialog>
      )
    }
    else {
      return (
        <Dialog isOpen={this.props.isOpen} icon={ IconNames.USER } title="Log In or Sign Up">
          <div className={Classes.DIALOG_BODY}>
            { this.renderLoginDialogContent() }
          </div>
        </Dialog>
      )
    }
  }

  private renderLoginDialogContent() {
    if (this.props.onLoginWithFacebook) {
      return (
            <Tabs
              animate={false}
              id="login-method"
              selectedTabId={ this.state.selectedProvider }
              onChange={ (tabId) => this.setState({ selectedProvider: tabId as ("email"|"facebook"), errorMessage: null })}
            >
              <Tab id="email" title="Email" panel={ this.renderEmailForm() } />
              <Tab id="facebook" title="Facebook" panel={ this.renderFacebookForm() } />
            </Tabs>
        )
    }
    else {
      return this.renderEmailForm()
    }
  }
  private renderFacebookForm() {
    return (
      <React.Fragment>
        {this.state.errorMessage !== null && <Callout intent={Intent.DANGER}>
          {this.state.errorMessage}
        </Callout> }

        <div className="login-dialog-buttons">
          <Button onClick={ () => this.props.onDismiss() }>Cancel</Button>
          { this.props.onLoginWithFacebook && <Button icon={IconNames.LOG_IN} intent={Intent.PRIMARY}
            onClick={ () => this.loginWithFacebook() }>Log In with your Facebook account</Button> }
        </div>
      </React.Fragment>
    )
  }

  private renderEmailForm() {
    return (
      <React.Fragment>
        {this.state.errorMessage !== null && <Callout intent={Intent.DANGER}>
          {this.state.errorMessage}
        </Callout> }

        <FormGroup
            label="Email"
        >
          <InputGroup id="username-input" placeholder="youremail@sailing.dream" leftIcon={ IconNames.USER }
            value={this.state.username} onChange={ (e:any) => this.setState({ username: e.target.value }) }/>
        </FormGroup>
        <FormGroup
            label="Password"
        >
          <InputGroup id="password-input" type="password" leftIcon={ IconNames.LOCK }
            value={this.state.password} onChange={ (e:any) => this.setState({ password: e.target.value }) }/>
        </FormGroup>

        <div className="login-dialog-buttons">
          <Button onClick={ () => this.props.onDismiss() }>Cancel</Button>
          <Button icon={IconNames.LOG_IN} onClick={ () => this.createAccountWithEmailAndPassword() }>Create account</Button>
          <Button icon={IconNames.LOG_IN} intent={Intent.PRIMARY} onClick={ () => this.loginWithEmailAndPassword() }>Log in</Button>
        </div>
      </React.Fragment>
    )
  }

  private loginWithEmailAndPassword() {
    this.setState({ loading: true })
    this.props.onLoginWithEmailAndPassword(this.state.username, this.state.password)
      .then(() => {
        this.setState({ loading: false, errorMessage: null, username: '', password: '' })
      })
      .catch((e) => {
        this.setState({ loading: false, errorMessage: e.message, password: '' })
      })
  }
  private createAccountWithEmailAndPassword() {
    this.setState({ loading: true })
    this.props.onCreateAccountWithEmailAndPassword(this.state.username, this.state.password)
      .then(() => {
        this.setState({ loading: false, errorMessage: null, username: '', password: '' })
      })
      .catch((e) => {
        this.setState({ loading: false, errorMessage: e.message, password: '' })
      })
  }

  private loginWithFacebook() {
    if (!this.props.onLoginWithFacebook) {
      return
    }

    this.setState({ loading: true, username: '', password: '' })
    this.props.onLoginWithFacebook()
      .then(() => {
        this.setState({ loading: false, errorMessage: null })
      })
      .catch((e) => {
        this.setState({ loading: false, errorMessage: e.message })
      })
  }
}