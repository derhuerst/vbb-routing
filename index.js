'use strict'

const path = require('path')
const {Database} = require('sqlite3')
const createQueue = require('queue')

const createFindSegments = require('./lib/find-segments')
const estimatePriority = require('./lib/estimate-priority')

const defaults = {
	resultsPerStep: 3, // todo: increase this
	maxDuration: 3600,
	transferTime: 30
}

const find = (db, origin, destination, start, cfg = {}) => {
	// todo: validate args
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
		transfers: 0,
		blacklist: [origin]
	}

	const queue = createQueue({autostart: true, concurrency: 1}) // todo
	const findSegments = createFindSegments(db, cfg)

	// todo: move into lib
	const addTask = (priority, task) => {
		if ('number' !== typeof priority) throw new Error('missing priority.')
		if ('function' !== typeof task) throw new Error('missing task.')

		let i
		for (i = 0; i < queue.jobs.length; i++) {
			if (priority < queue.jobs[i].priority) break
		}

		task.priority = priority
		queue.splice(i, 0, task)
	}

	const createTask = (segment) => (cb) => {
		findSegments(segment, (err, newSegments) => {
			if (err) return cb(err)

			for (let newSegment of newSegments) {
				const priority = estimatePriority(newSegment, cfg)
				addTask(priority, createTask(segment))
			}
			cb()
		})
	}

	addTask(0, createTask(firstSegment))
	return new Promise((resolve, reject) => {
		queue.once('error', (err) => queue.end(err))
		queue.once('end', (err) => {
			if (err) reject(err)
			else resolve()
		})
	}) // todo: better API
}

const db = new Database(path.join(__dirname, 'index.sqlite'))
find(db, 'center', 'airport', 1554307600)
.catch((err) => {
	console.error(err)
	process.exitCode = 1
})
