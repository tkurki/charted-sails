import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import { IntroductionPanel } from './IntroductionPanel';

storiesOf("Components/IntroductionPanel", module)
  .add('default intro', () => (
    <div style={ { padding:"20px 100px" } } >
      <IntroductionPanel onFileSelected={ f => action('File dropped' + JSON.stringify(f)) }/>
    </div>
  )
)