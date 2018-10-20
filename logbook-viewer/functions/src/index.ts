import { ApolloServer } from 'apollo-server-express';
import cors from 'cors';
import express from 'express';
import * as functions from 'firebase-functions';
import * as schemaPrinter from 'graphql/utilities/schemaPrinter';
import { config } from './firebase-admin';
import resolvers from './graphql/resolvers';
import schema from './graphql/schema';

const app: express.Application = express()

app.use((_, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  return next();
});

app.use(cors({ origin: true }))

app.use('/schema', (_, res) => {
  res.set('Content-Type', 'text/plain');
  console.log(`schemaPrinter: ${schemaPrinter}`)
  res.send(schemaPrinter.printSchema(schema));
});

// To enable introspection: firebase functions:config:set apollo.allow_introspection=true
let allowIntrospection
if (config && config.apollo && config.apollo.allow_introspection === 'true') {
  allowIntrospection = true
}
const graphQLServer = new ApolloServer({ schema, resolvers, introspection: allowIntrospection })
graphQLServer.applyMiddleware({ app , path: '/' });

exports.api = functions.https.onRequest(app);