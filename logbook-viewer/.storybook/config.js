import { configure } from '@storybook/react';
import '../src/index.css'

// automatically import all files ending in *.stories.js
const req = require.context('../src', true, /.stories.tsx$/);
function loadStories() {
  console.log("Loading stories", req)
  req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);
