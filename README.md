# Charted Sails

Data visualization of sailing logs.

## Using the web interface

Visit [www.chartedsails.com](http://www.chartedsails.com) for the latest version
of this project.

## Developpers

This is a monorepo containing two projects:

 - `strongly-signalk` is a strongly typed library (typescript) to load, analyze
 and manipulate sailing data.
 - `logbook-viewer` is the React webapp that powers chartedsails.com.

To get started with the monorepo, run:

```sh
$ yarn install
$ yarn bootstrap
```

This will load all the dependencies and prepare both projects.

Then when doing changes to `strongly-signalk`, make sure to run `yarn build` so
that changes are built and visible in the webapp (or if you are very fancy, run
`tsc -w` to have the typescript compiler watch your files and push them in realtime).

To run the webapp, you will need to [get a MapBox API Key](https://www.mapbox.com)
and then:
```sh
$ cd logbook-viewer
$ REACT_APP_MAPBOX_TOKEN=yourmapboxtoken yarn start
```
(You can also save the key to `logbook-viewer/.env.local`)

## License

Copyright Thomas Sarlandie 2018.

Both projets released under the MIT license.