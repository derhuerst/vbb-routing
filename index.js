'use strict'

const path = require('path')
const {Database} = require('sqlite3')

const createFindSegments = require('./lib/find-segments')

// center lake 1554308040 360 B
// lake airport 1554308520 480 B

// {
// 	previousSegment: {
// 		previousSegment: {
// 			// starting here
// 			previousSegment: null
// 			where: 'center',
// 			duration: 0,
// 			when: 1554307600,
// 			totalDuration: 0,
// 			route: null
// 		},
// 		where: 'lake',
// 		duration: 360,
// 		when: 1554308040 + 360, // arrival
// 		totalDuration: 360 + 0,
// 		route: 'B'
// 	},
// 	// stopping here
// 	where: 'airport',
// 	duration: 480,
// 	when: 1554308520 + 480, // arrival
// 	totalDuration: 360 + 480 + 0,
// 	route: 'B'
// }

const find = (db, where, when) => {
	const start = {
		previousSegment: null,
		where,
		duration: 0,
		when,
		totalDuration: 0,
		route: null,
		blacklist: [where]
	}

	const resultsPerStep = 3
	const latestArrival = start.when + 3600
	const transferTime = 30
	const findSegments = createFindSegments(db, resultsPerStep, latestArrival, transferTime)

	findSegments(start, (err, segments1) => {
		if (err) return console.error(err) // todo

		for (let segment1 of segments1) {
			findSegments(segment1, (err, segments2) => {
				if (err) return console.error(err) // todo

				for (let segment2 of segments2) {
					console.log(segment2)
				}
			})
		}
	})
}

const db = new Database(path.join(__dirname, 'index.sqlite'))
find(db, 'center', 1554307600)
