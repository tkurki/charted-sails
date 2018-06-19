# Babel SignalK

A library to read a bunch of log formats and convert them into SignalK data.

The general principle is that we will read a logfile and produce a SKDelta
object that will have SignalK updates. Each update contains a timestamp and a
set of variables.

## Supported formats

 - Expedition CSV log files
