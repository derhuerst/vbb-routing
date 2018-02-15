'use strict'

const path = require('path')
const computeStopoverTimes = require('gtfs-utils/compute-stopover-times')
const readCsv = require('gtfs-utils/read-csv')

const timezone = 'Europe/Berlin'

// todo: real data
const srcDir = path.dirname(require.resolve('sample-gtfs-feed/gtfs/routes.txt'))

const sortStopovers = (s1, s2) => {
	return parseInt(s1.stop_sequence) - parseInt(s2.stop_sequence)
}

const computeSegments = () => {
	return new Promise((resolve, reject) => {
		const stopovers = computeStopoverTimes({
			services: readCsv(path.join(srcDir, 'calendar.txt')),
			serviceExceptions: readCsv(path.join(srcDir, 'calendar_dates.txt')),
			trips: readCsv(path.join(srcDir, 'trips.txt')),
			stopovers: readCsv(path.join(srcDir, 'stop_times.txt'))
		}, {}, timezone)
		stopovers.once('error', (err) => {
			stopovers.destroy()
			reject(err)
		})

		const acc = Object.create(null)
		stopovers.on('data', (stopover) => {
			const key = stopover.trip_id + '-' + stopover.start_of_trip
			let stopovers = acc[key]
			if (!Array.isArray(stopovers)) stopovers = acc[key] = []
			stopovers.push(stopover)
		})

		stopovers.once('end', () => {
			const segments = []
			for (let key in acc) {
				const stopovers = acc[key].sort(sortStopovers)
				acc[key] = null // allow for GC

				const msg = 'acc[' + key + ']'
				for (let i = 1; i < stopovers.length; i++) {
					const a = stopovers[i - 1]
					if (!a) throw new Error(`${msg}[${i - 1}] is falsy.`)
					if ('number' !== typeof a.departure) {
						throw new Error(`${msg}[${i - 1}].departure is not a number.`)
					}

					const b = stopovers[i]
					if (!b) throw new Error(`${msg}[${i}] is falsy.`)
					if ('number' !== typeof a.arrival) {
						throw new Error(`${msg}[${i - 1}].arrival is not a number.`)
					}

					segments.push([
						a.stop_id,
						b.stop_id,
						a.departure,
						b.arrival - a.departure,
						a.route_id
					])
				}
			}
			resolve(segments)
		})
	})
}

module.exports = computeSegments
