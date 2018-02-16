'use strict'

const emptyLeg = (station, route) => ({
	origin: null,
	departure: null,
	destination: null,
	arrival: null,
	route,
	passed: [{
		station: station,
		departure: null
	}]
})

const finishLeg = (leg) => {
	const firstPassed = leg.passed[0]
	const lastPassed = leg.passed[leg.passed.length - 1]
	leg.origin = firstPassed.station
	leg.departure = firstPassed.departure
	leg.destination = lastPassed.station
	leg.arrival = lastPassed.arrival
}

const formatDate = t => new Date(t * 1000) + ''

const segmentToJourney = (segment) => {
	// build segments list
	const segments = []
	let s = segment
	while (s) {
		if (s.previousSegment === s) {
			throw new Error('previousSegment has a circular reference.')
		}
		segments.unshift(s)
		s = s.previousSegment
	}
	if (segments.length < 2) throw new Error('at least 2 segments necessary.')

	const journey = {
		legs: [],
		origin: segments[0].where,
		departure: null,
		destination: null,
		arrival: null
	}

	// insert first leg manually
	journey.legs.push(emptyLeg(segments[0].where, segments[1].route))

	// build journey
	let prevRoute = segments[1].route // force continue, because we skip first
	for (let i = 1; i < segments.length; i++) { // skip first segment here
		const s = segments[i]
		const prevLeg = journey.legs[journey.legs.length - 1]
		let leg = prevLeg

		if (s.route !== prevRoute) {
			// finish previous leg
			finishLeg(prevLeg)

			// start new leg
			const lastSegment = segments[i - 1]
			leg = emptyLeg(lastSegment.where, s.route)
			journey.legs.push(leg)

			prevRoute = s.route
		}

		const prevPassed = leg.passed[leg.passed.length - 1]
		if (prevPassed) prevPassed.departure = formatDate(s.when - s.duration)
		leg.passed.push({
			station: s.where, // todo: station object
			arrival: formatDate(s.when)
		})
	}

	// finish last leg manually
	const lastLeg = journey.legs[journey.legs.length - 1]
	finishLeg(lastLeg)

	// add shorthands
	const firstLeg = journey.legs[0]
	journey.departure = firstLeg.departure || null
	journey.destination = lastLeg.destination || null
	journey.arrival = lastLeg.arrival || null

	return journey
}

module.exports = segmentToJourney
