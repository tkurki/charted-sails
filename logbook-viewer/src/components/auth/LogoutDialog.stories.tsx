import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import '../../index.css';
import LogoutDialog from './LogoutDialog';

const stories = storiesOf('Components/LogoutDialog', module)

stories.add('Logout', () => {
  return (
    <LogoutDialog isOpen={ true }
      onLogout={ action('logout') }
      onDismiss={ action(`dismiss`) }/>
  )
})
