'use strict'

const {Database} = require('sqlite3')
const createQueue = require('async.queue')

const importSegments = (db, segments) => {
	return new Promise((resolve, reject) => {
		const importSegment = (segment, cb) => {
			db.run(
				'INSERT INTO edges VALUES (?, ?, ?, ?, ?);\n',
				segment[0], // a.stop_id,
				segment[1], // b.stop_id,
				segment[2], // a.departure,
				segment[3], // duration
				segment[4], // route_id
				cb
			)
		}

		const queue = createQueue(importSegment, 4)
		queue.error = (err) => {
			queue.kill()
			reject(err)
		}
		queue.drain = () => {
			resolve()
		}

		db.run(`CREATE TABLE edges (
			source text,
			target text,
			timestamp integer,
			duration smallint,
			route_id text
		)`, (err) => {
			if (err) return reject(err)

			queue.push(segments)
		})
	})
}

module.exports = importSegments
