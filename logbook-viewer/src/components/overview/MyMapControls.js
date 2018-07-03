import {experimental} from 'react-map-gl';

/**
 * A custom MapControl with a callback so we can know when the user starts
 * interacting with the map.
 */
export default class MyMapControls extends experimental.MapControls {
  setOptions(options) {
    super.setOptions(options);
    if ('onUserInteraction' in options) {
      this.onUserInteraction = options.onUserInteraction;
    }
  }

  handleEvent(event) {
    super.handleEvent(event);
    if (this.onUserInteraction) {
      this.onUserInteraction(event);
    }
  }
}