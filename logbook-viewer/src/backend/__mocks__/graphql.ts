// Workaround because the full solution does not work yet.
export const graphqlClient = {}

// Read https://www.robinwieruch.de/react-apollo-client-testing/
// to implement a real-working client using a local schema.

/*
import { InMemoryCache } from "apollo-cache-inmemory";
import ApolloClient from "apollo-client";
import { SchemaLink } from 'apollo-link-schema';
import gql from "graphql-tag";
import { makeExecutableSchema } from 'graphql-tools';

const schema = gql``
const resolvers = {}

const cache = new InMemoryCache();

const executableSchema = makeExecutableSchema({
  typeDefs: schema,
  resolvers,
  resolverValidationOptions: {
    requireResolversForResolveType: false,
  },
});

export const graphqlClient = new ApolloClient({
  link: new SchemaLink({ schema: executableSchema }),
  cache
});
*/