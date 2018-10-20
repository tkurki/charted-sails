import { Callout, Intent, Menu, Spinner } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { User } from "firebase";
import * as React from 'react';
import { Query } from "react-apollo";
import { GET_USER_LOGFILES, Logfile } from "../../backend/gql";

interface TripListProps {
  user: User|null
  onTripSelected: (url: string)=>void
}

export default function TripList(props: TripListProps) {
  if (props.user === null) {
    return <div />
  }

  return (
    <Query query={GET_USER_LOGFILES} variables={ {userId: props.user.uid }}>
    { ({ data, loading, error }) => {
      if (loading) {
        return <Spinner />
      }
      if (error) {
        return <Callout intent={Intent.WARNING}>{error.message}</Callout>
      }

      const menuItems = data.logfilesByUser.map((f:Logfile) => (
        <Menu.Item id={f.id} icon={IconNames.MAP} text={ f.name }
          onClick={ () => props.onTripSelected(f.url) } />
      ))
      return (
        <Menu>
          { menuItems }
        </Menu>
      )
    }}
    </Query>
  )
}