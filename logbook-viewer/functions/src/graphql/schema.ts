import * as graphqlTools from 'graphql-tools';
import resolvers from './resolvers';

const schema = `
type Logfile {
  id: ID!
  uploaderId: String!
  name: String!
  url: String
}
type Query {
  logfiles: [Logfile]
  logfilesByUser(userId: ID!): [Logfile]
}
schema {
  query: Query
}
`;

export default graphqlTools.makeExecutableSchema({
  typeDefs: schema,
  resolvers
});