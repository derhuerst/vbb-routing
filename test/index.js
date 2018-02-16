'use strict'

const test = require('tape')

const segmentToJourney = require('../lib/segment-to-journey')

const start = {
	where: 'one',
	when: 9000,
	route: null,
	duration: 0,

	transfers: 0,
	blacklist: ['one'],
	previousSegment: null
}

const a1 = {
	where: 'two',
	when: 10000 + 100,
	route: 'a',
	duration: 100,

	transfers: start.transfers + 0,
	blacklist: start.blacklist.concat('two'),
	previousSegment: start
}
const a2 = {
	where: 'three',
	when: a1.when + 150,
	route: 'a',
	duration: 150,

	transfers: a1.transfers + 0,
	blacklist: a1.blacklist.concat('three'),
	previousSegment: a1
}

const b1 = {
	where: 'four',
	when: a2.when + 60 + 200, // 1 min transfer
	route: 'b',
	duration: 200,

	transfers: a2.transfers + 1,
	blacklist: a2.blacklist.concat('four'),
	previousSegment: a2
}
const b2 = {
	where: 'five',
	when: b1.when + 250,
	route: 'b',
	duration: 250,

	transfers: b1.transfers + 0,
	blacklist: b1.blacklist.concat('five'),
	previousSegment: b1
}

test('lib/segment-to-journey', (t) => {
	// todo: check if throws
	t.plan(1)

	const formatDate = t => new Date(t * 1000) + ''
	t.deepEqual(segmentToJourney(b2), {
		legs: [{
			origin: 'one',
			departure: formatDate(10000),
			destination: 'three',
			arrival: formatDate(10000 + 100 + 150),
			route: 'a',
			passed: [{
				station: 'one',
				departure: formatDate(10000)
			}, {
				station: 'two',
				arrival: formatDate(10000 + 100),
				departure: formatDate(10000 + 100)
			}, {
				station: 'three',
				arrival: formatDate(10000 + 100 + 150)
			}]
		}, {
			origin: 'three',
			departure: formatDate(10310), // 1st leg + transfer + waiting
			destination: 'five',
			arrival: formatDate(10310 + 200 + 250),
			route: 'b',
			passed: [{
				station: 'three',
				departure: formatDate(10310)
			}, {
				station: 'four',
				arrival: formatDate(10310 + 200),
				departure: formatDate(10310 + 200)
			}, {
				station: 'five',
				arrival: formatDate(10310 + 200 + 250)
			}]
		}],
		origin: 'one',
		departure: formatDate(10000),
		destination: 'five',
		arrival: formatDate(10310 + 200 + 250)
	})
})

// todo
