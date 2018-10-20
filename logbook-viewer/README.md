# Charted Sails Web Application

## Getting Started

Visit [www.chartedsails.com](http://www.chartedsails.com) to see the latest
published version of this project.

## Development

First, [get a Mapbox Token](https://www.mapbox.com) and save it:

```sh
$ echo REACT_APP_MAPBOX_TOKEN=pk.eyxxxxx > .env.local
```

Then, to launch the app locally:

```sh
$ yarn start
```

To work on React components one by one:

```sh
$ yarn storybook
```

To run tests:
```sh
$ yarn test
```

## Firebase configuration

This project uses Firebase for the backend.

### Configure CORS on your storage

    gsutil cors set firebase-storage-cors.json gs://chartedsails.appspot.com

## License

MIT
