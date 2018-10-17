import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import '../../index.css';
import UserButton from './UserButton';

const stories = storiesOf('Components/UserPanel', module)

stories.add('Not logged in', () => {
  return (
    <UserButton
      userInfo={ null }
      onLoginWithEmailAndPassword={ () => Promise.resolve() }
      onCreateAccountWithEmailAndPassword={ () => Promise.resolve() }
      onLogout={ action('logout') } />
  )
})

stories.add('Logged in user with display name', () => {
  return (
    <UserButton
      userInfo={ { displayName: 'a sailor', email: 'yoyo@sailer.com', phoneNumber: null, photoURL: null, providerId: 'test', uid: 'testuser' } }
      onLoginWithEmailAndPassword={ () => Promise.resolve() }
      onCreateAccountWithEmailAndPassword={ () => Promise.resolve() }
      onLogout={ action('logout') } />
  )
})

stories.add('Logged in user without display name', () => {
  return (
    <UserButton
      userInfo={ { displayName: null, email: 'yoyo@sailer.com', phoneNumber: null, photoURL: null, providerId: 'test', uid: 'testuser' } }
      onLoginWithEmailAndPassword={ () => Promise.resolve()}
      onCreateAccountWithEmailAndPassword={ () => Promise.resolve() }
      onLogout={ action('logout') } />
  )
})
