import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import '../../index.css';
import LoginDialog from './LoginDialog';

const stories = storiesOf('Components/LoginDialog', module)

stories.add('Login after 1 sec', () => {
  return (
    <LoginDialog isOpen={ true }
      onLoginWithEmailAndPassword={ (username:string, password: string) => {
        action(`Now logging in with ${username}/${password}`)
        return new Promise(resolve => {
          setTimeout(() => { resolve() }, 1000)
        })
      } }
      onCreateAccountWithEmailAndPassword={ (username:string, password: string) => {
        action(`Now logging in with ${username}/${password}`)
        return new Promise(resolve => {
          setTimeout(() => { resolve() }, 1000)
        })
      } }
      onDismiss={ action(`dismiss`) }/>
  )
})

stories.add('Login exception after 1 sec', () => {
  return (
    <LoginDialog isOpen={ true }
      onLoginWithEmailAndPassword={ (username:string, password: string) => {
        action(`Now logging in with ${username}/${password}`)
        return new Promise((_, reject) => {
          setTimeout(() => { reject(new Error('something terrible happened')) }, 1000)
        })
      } }
      onCreateAccountWithEmailAndPassword={ (username:string, password: string) => {
        action(`Now logging in with ${username}/${password}`)
        return new Promise(resolve => {
          setTimeout(() => { resolve() }, 1000)
        })
      } }
      onDismiss={ action(`dismiss`) } />
  )
})

stories.add('Login with facebook enabled', () => {
  return (
    <LoginDialog isOpen={ true }
      onLoginWithEmailAndPassword={ () => {
        return new Promise((_, reject) => {
          setTimeout(() => { reject(new Error('try facebook')) }, 1000)
        })
      } }
      onLoginWithFacebook={ () => {
        action(`Now logging in with facebook`)
        return new Promise((resolve) => {
          setTimeout(() => { resolve() }, 1000)
        })
      } }
      onCreateAccountWithEmailAndPassword={ () => {
        return new Promise((_, reject) => {
          setTimeout(() => { reject(new Error('try facebook')) }, 1000)
        })
      } }

      onDismiss={ action(`dismiss`) } />
  )
})