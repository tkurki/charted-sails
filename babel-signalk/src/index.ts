#!/usr/bin/node

export * from './CSVLoader'
export * from './ExpeditionFormat'

// If ran from the command line we offer a simple CLI
if (require.main === module) {
  console.log("Running signalk-babel!")
}