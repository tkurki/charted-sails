import { Button, Intent } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { UserInfo } from 'firebase';
import * as React from 'react';
import LoginDialog from './LoginDialog';
import LogoutDialog from './LogoutDialog';

interface UserButtonProps {
  userInfo: UserInfo | null
  style?: React.CSSProperties
  id?: string
  onLoginWithEmailAndPassword: (username:string, password:string) => Promise<void>
  onCreateAccountWithEmailAndPassword: (username:string, password:string) => Promise<void>
  onLoginWithFacebook?: () => Promise<void>
  onLogout: () => void
}

interface UserButtonState {
  showingLoginDialog: boolean
  showingLogoutDialog: boolean
}

export default class UserButton extends React.Component<UserButtonProps, UserButtonState> {
  constructor(props: UserButtonProps) {
    super(props)
    this.state = {
      showingLoginDialog: false,
      showingLogoutDialog: false
    }
  }

  public render() {
    return (
      <React.Fragment>
        { this.props.userInfo && (
          <Button id={this.props.id} icon={IconNames.USER} onClick={ () => this.setState({ showingLogoutDialog: true }) }>
            {this.props.userInfo.displayName ? this.props.userInfo.displayName : this.props.userInfo.email }
          </Button>
        )}
        { !this.props.userInfo && (
          <Button  id={this.props.id} icon={IconNames.LOG_IN} intent={Intent.PRIMARY} onClick={ () => this.setState({ showingLoginDialog: true }) }>
            Login
          </Button>
        )}
        <LoginDialog isOpen={ this.state.showingLoginDialog }
          onLoginWithEmailAndPassword={ (username, password) => this.loginWithEmailAndPassword(username, password) }
          onCreateAccountWithEmailAndPassword={ (username, password) => this.createAccountWithEmailAndPassword(username, password) }
          onLoginWithFacebook={ this.props.onLoginWithFacebook ? (() => this.loginWithFacebook()) : undefined }
          onDismiss={ () => this.setState({ showingLoginDialog: false }) }/>
        <LogoutDialog isOpen={ this.state.showingLogoutDialog }
          onLogout={ () => this.logout() }
          onDismiss={ () => {this.setState({ showingLogoutDialog: false })}} />

      </React.Fragment>
    )
  }

  private loginWithEmailAndPassword(username: string, password: string) {
    return this.props.onLoginWithEmailAndPassword(username, password).then(() => {
      this.setState({ showingLoginDialog: false })
    })
  }

  private createAccountWithEmailAndPassword(username: string, password: string) {
    return this.props.onCreateAccountWithEmailAndPassword(username, password).then(() => {
      this.setState({ showingLoginDialog: false })
    })
  }

  private loginWithFacebook() {
    if (this.props.onLoginWithFacebook) {
      return this.props.onLoginWithFacebook().then(() => {
        this.setState({ showingLoginDialog: false })
      })
    }
    else {
      this.setState({ showingLoginDialog: false })
      return Promise.resolve()
    }
  }

  private logout() {
    this.props.onLogout()
    this.setState({ showingLogoutDialog: false })
  }
}

