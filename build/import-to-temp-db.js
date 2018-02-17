'use strict'

const computeStopoverTimes = require('gtfs-utils/compute-stopover-times')
const {Writable} = require('stream')
const pump = require('pump')
const makeParallel = require('concurrent-writable')

const createTable = require('./create-table')
const readData = require('./read-data')

const TIMEZONE = 'Europe/Berlin'

const SCHEMA = {
	stop_id: 'text',
	trip_id: 'text',
	route_id: 'text',
	sequence: 'smallint',
	duration: 'smallint',
	timestamp: 'integer'
}

const importToTempDb = (tempDb) => {
	const stopovers = computeStopoverTimes({
		services: readData('calendar.txt'),
		serviceExceptions: readData('calendar_dates.txt'),
		trips: readData('trips.txt'),
		stopovers: readData('stop_times.txt')
	}, {}, TIMEZONE)

	let row = 0
	const importWrite = (stopover, _, cb) => {
		tempDb.run(
			'INSERT INTO stopovers VALUES (?, ?, ?, ?, ?, ?);',
			// see SCHEMA above
			// todo: service_id, trip_id
			// todo: departure?
			stopover.stop_id,
			stopover.trip_id,
			stopover.route_id,
			parseInt(stopover.sequence),
			stopover.arrival - stopover.departure,
			stopover.arrival,
			cb
		)
	}

	const importer = new Writable({
		highWaterMark: 20,
		objectMode: true,
		write: importWrite
	})
	makeParallel(importer, 10)

	return new Promise((resolve, reject) => {
		createTable(tempDb, 'stopovers', SCHEMA, (err) => {
			if (err) return reject(err)

			pump(stopovers, importer, (err) => {
				if (err) reject(err)
				else resolve()
			})
		})
	})
}

module.exports = importToTempDb
