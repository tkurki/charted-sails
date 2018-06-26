# Aldis Viewer Proto

## Todo

 - [x] Get a base React app working with server
 - [x] Load a Expedition logfile into memory and show points on the map
 - [x] Show a hovering bubble (or fixed) with some data (BSP. COG, SOG, AWS, AWA)
 - [x] Add a time slider to move the represented time
 - [ ] Add a time slider to move the represented time and allow selection of a time period
 - [ ] Show graph of boat speed over time
 - [ ] Add overlay with wind speed arrows
 - [ ] Polar?
 - [ ] Drag/Drop CSV file from Expedition


## Interactions

As a user, I can drag the time slider, the data panel represents the moment currently selected and there should be a highlight (or a little moving boat) on the map.

As a user, I can click on the map and the timer slider should jump there.

As a user, I can hover over the map and the timer slider shows a ghost symbole of where I am hovering. The data panel can also show the data in ghost mode.



"Selected" - one segment that the user has selected via the time slider or by clicking on the trace.
"Hovered" - on segment the user is moving over.

Next steps:
Make selected be more than one segment.