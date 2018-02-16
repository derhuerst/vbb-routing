'use strict'

const path = require('path')
const {Database} = require('sqlite3')
const RunQueue = require('run-queue')

const createFindSegments = require('./lib/find-segments')
const estimatePriority = require('./lib/estimate-priority')

const defaults = {
	resultsPerStep: 3, // todo: increase this
	maxDuration: 3600,
	transferTime: 30
}

const find = (db, origin, destination, start, cfg = {}) => {
	cfg = Object.assign({}, defaults, cfg)
	cfg.origin = origin
	cfg.destination = destination
	cfg.start = start

	const firstSegment = {
		previousSegment: null,
		where: origin,
		when: start,
		route: null,
		duration: 0,
		totalDuration: 0,
		blacklist: [origin]
	}

	const queue = new RunQueue({maxConcurrency: 1}) // todo
	const findSegments = createFindSegments(db, cfg)

	const loop = (segment, cb) => {
		findSegments(segment, (err, newSegments) => {
			if (err) return cb(err)

			for (let newSegment of newSegments) {
				const priority = estimatePriority(newSegment, cfg)
				queue.add(priority, loop, [newSegment])
			}
			cb()
		})
	}
}

const db = new Database(path.join(__dirname, 'index.sqlite'))
find(db, 'center', 'airport', 1554307600)
