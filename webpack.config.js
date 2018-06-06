const resolve = require('path').resolve;
const webpack = require('webpack');

module.exports = {
  entry: resolve('./root.js'),

  devtool: 'source-map',

  module: {
    rules: [
      {
        // Compile ES2015 using babel
        test: /\.(tsx?)|(js)$/,
        exclude: [/node_modules/],
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        // Load CSV file with csv-loader
        test: /\.csv$/,
        loader: 'csv-loader',
        options: {
          dynamicTyping: true,
          header: true,
          skipEmptyLines: true
        }
      }
    ]
  },

  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
    alias: {
      'mapbox-gl$': resolve('./node_modules/mapbox-gl/dist/mapbox-gl.js')
    }
  },

  plugins: [

    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
        MapboxAccessToken: JSON.stringify(
          process.env.MapboxAccessToken || process.env.MAPBOX_TOKEN
        ),
      },
    }),

  ],
};
