import gql from "graphql-tag";

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
