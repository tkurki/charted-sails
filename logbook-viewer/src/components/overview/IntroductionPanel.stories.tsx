import { storiesOf } from '@storybook/react';
import * as React from 'react';
import '../../index.css';
import { IntroductionPanel } from './IntroductionPanel';

storiesOf("Components/IntroductionPanel", module)
  .add('default intro', () => (
    <div style={ { padding:"20px 100px" } } >
      <IntroductionPanel onFileSelected={ (f) => { console.log(f.name) } }/>
    </div>
  )
)