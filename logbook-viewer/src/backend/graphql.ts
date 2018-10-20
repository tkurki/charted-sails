import { InMemoryCache } from "apollo-cache-inmemory";
import ApolloClient from "apollo-client";
import { HttpLink } from "apollo-link-http";

const CHARTEDSAILS_BASE_URL = process.env.REACT_APP_GRAPHQL_ENDPOINT ?
  process.env.REACT_APP_GRAPHQL_ENDPOINT : 'http://localhost:5000/chartedsails/us-central1/api'

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



