import { InMemoryCache } from "apollo-cache-inmemory";
import ApolloClient from "apollo-client";
import { HttpLink } from "apollo-link-http";
import gql from 'graphql-tag';

const CHARTEDSAILS_BASE_URL = process.env.REACT_APP_GRAPHQL_ENDPOINT
if (!CHARTEDSAILS_BASE_URL) {
  throw new Error("You must define $REACT_APP_GRAPHQL_ENDPOINT")
}

const httpLink = new HttpLink({
  uri: CHARTEDSAILS_BASE_URL,
  headers: {
    // authorization: `Bearer ${
    //   process.env.REACT_APP_GITHUB_PERSONAL_ACCESS_TOKEN
    // }`,
  },
})
const cache = new InMemoryCache()

export const graphqlClient = new ApolloClient({
  link: httpLink,
  cache
})

export interface Logfile {
  id: string
  uploaderId: string
  name: string
  url: string
}

export const GET_ALL_LOGFILES = gql`
{
  logfiles {
    id, uploaderId, name, url
  }
}`

export const GET_USER_LOGFILES = gql`
query LogFilesByUser($userId: ID!) {
  logfilesByUser(userId: $userId) {
    id, uploaderId, name, url
  }
}
`
