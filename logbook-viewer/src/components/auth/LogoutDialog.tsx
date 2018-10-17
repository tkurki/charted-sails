import { Button, Callout, Classes, Dialog, Intent } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';
import './LogoutDialog.css';

interface LogoutDialogProps {
  isOpen: boolean
  onLogout: () => void
  onDismiss: () => void
}

export default class LogoutDialog extends React.Component<LogoutDialogProps> {
  constructor(props: LogoutDialogProps) {
    super(props)
  }

  public render() {
    return (
      <Dialog isOpen={this.props.isOpen}>
        <div className={Classes.DIALOG_BODY}>
          <Callout icon={ IconNames.LOG_OUT }>
            Log out?
          </Callout>

          <div className="logout-dialog-buttons">
            <Button onClick={ () => this.props.onDismiss() }>Cancel</Button>
            <Button icon={IconNames.LOG_IN} intent={Intent.WARNING} onClick={ () => this.props.onLogout() }>Log out</Button>
          </div>
        </div>
      </Dialog>
    )
  }
}