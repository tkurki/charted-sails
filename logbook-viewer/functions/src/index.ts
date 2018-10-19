import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import * as functions from 'firebase-functions';
import * as schemaPrinter from 'graphql/utilities/schemaPrinter';
import resolvers from './graphql/resolvers';
import schema from './graphql/schema';


const app: express.Application = express()

app.use((_, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  return next();
});

app.use('/schema', (_, res) => {
  res.set('Content-Type', 'text/plain');
  console.log(`schemaPrinter: ${schemaPrinter}`)
  res.send(schemaPrinter.printSchema(schema));
});

const graphQLServer = new ApolloServer({ schema, resolvers })
graphQLServer.applyMiddleware({ app , path: '/' });

exports.api = functions.https.onRequest(app);