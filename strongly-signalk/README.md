# Strongly SignalK

A strongly typed SignalK library written in TypeScript. Can be used in
JavaScript and TypeScript projects.

This library is designed for developers writing interactive marine apps and
need to manipulate data in SignalK format.

A strong design decision is that the in-memory representation should be
directly compatible with SignalK via `JSON.serialize()` calls.

Inversely, any valid SignalK file can be parsed and loaded by strongly-signalk.

However, another strong design decision is to not implement all the subtle and less used
attributes of the SignalK specification which means that some signalK files
that are valid may lose some information when they are parsed into
strongly-signalk.

## Getting started

```
npm install strongly-signalk
```

## Key concepts



## License

MIT