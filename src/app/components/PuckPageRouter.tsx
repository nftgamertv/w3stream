import React from 'react'
import { pageHashParams } from "@legendapp/state/helpers/pageHashParams"
import { Switch } from "@legendapp/state/react"
 
// import Calendar from '../../components/Calendar'
export default function Router({ components }) {
  console.log(components, 'components')
  return (
    <div>
      <Switch value={pageHashParams.page}>
        {{
          undefined: () => <div />,
          '': () => <div />,

        }}
      </Switch>
    </div>
  )
}