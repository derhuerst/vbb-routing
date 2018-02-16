# vbb-routing

**Compute [journeys](https://github.com/public-transport/friendly-public-transport-format/blob/1.0.1/spec/readme.md#journey) based on the [VBB GTFS data](https://github.com/derhuerst/vbb-gtfs.jannisr.de).**

[![npm version](https://img.shields.io/npm/v/vbb-routing.svg)](https://www.npmjs.com/package/vbb-routing)
[![build status](https://api.travis-ci.org/derhuerst/vbb-routing.svg?branch=master)](https://travis-ci.org/derhuerst/vbb-routing)
![ISC-licensed](https://img.shields.io/github/license/derhuerst/vbb-routing.svg)
[![chat with me on Gitter](https://img.shields.io/badge/chat%20with%20me-on%20gitter-512e92.svg)](https://gitter.im/derhuerst)
[![support me on Patreon](https://img.shields.io/badge/support%20me-on%20patreon-fa7664.svg)](https://patreon.com/derhuerst)


## Installing

```shell
npm install vbb-routing
```


## Usage

```js
todo
```


## Segment model

Starting to walk the graph, our first segment looks like this:

```js
const first = {
	// edge info
	where: 'center', // arrival node
	when: 1554307600, // start time
	route: null, // we just started, so no route ID
	duration: 0, // we just started, so edge duration

	// current state
	totalDuration: 0,
	blacklist: ['center'], // node we don't want to visit again
	previousSegment: null
}
```

A follow-up segment (the result of a single edge in the graph) may then look like this:

```js
const second = {
	// edge info
	where: 'lake',
	when: 1554308040 + 360, // arrival time
	route: 'B',
	duration: 360,

	// current state
	totalDuration: 360 + first.totalDuration,
	blacklist: first.blacklist.concat('lake'),
	previousSegment: first
}
```


## Contributing

If you have a question or have difficulties using `vbb-routing`, please double-check your code and setup first. If you think you have found a bug or want to propose a feature, refer to [the issues page](https://github.com/derhuerst/vbb-routing/issues).
