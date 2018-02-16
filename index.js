'use strict'

const createQueue = require('queue')
const {EventEmitter} = require('events')

const createFindSegments = require('./lib/find-segments')
const estimatePriority = require('./lib/estimate-priority')

const isObj = o => o !== null && 'object' === typeof o && !Array.isArray(o)

const defaults = {
	resultsPerStep: 3, // todo: increase this
	maxDuration: 3600,
	transferTime: 30
}

const find = (db, origin, destination, start, cfg = {}) => {
	if (!db) throw new Error('missing db.')
	if ('string' !== typeof origin) throw new Error('origin must be a string.')
	if ('string' !== typeof destination) throw new Error('destination must be a string.')
	if ('number' !== typeof start) throw new Error('start must be a number.')
	if (!isObj(cfg)) throw new Error('cfg must be an object.')

	cfg = Object.assign({}, defaults, cfg)
	cfg.origin = origin
	cfg.destination = destination
	cfg.start = start

	const queue = createQueue({autostart: true, concurrency: 1}) // todo
	const out = new EventEmitter()
	queue.on('error', (err) => {
		queue.end(err) // todo: necessary?
		out.emit('error', err)
	})
	queue.on('end', (err) => out.emit('end', err))

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

	const findSegments = createFindSegments(db, cfg)
	const createTask = (segment) => (cb) => {
		findSegments(segment, (err, newSegments) => {
			if (err) return cb(err)

			for (let newSegment of newSegments) {
				if (newSegment.where === destination) {
					out.emit('result', newSegment)
				} else {
					const priority = estimatePriority(newSegment, cfg)
					addTask(priority, createTask(segment))
				}
			}
			cb()
		})
	}

	addTask(0, createTask({
		previousSegment: null,
		where: origin,
		when: start,
		route: null,
		duration: 0,
		totalDuration: 0,
		transfers: 0,
		blacklist: [origin]
	}))
	return out
}

module.exports = find
