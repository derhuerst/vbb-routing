'use strict'

const {Readable, Writable} = require('stream')
const pump = require('pump')
// const makeParallel = require('concurrent-writable') // todo

const createTable = require('./create-table')

const importIntoRealDb = (db) => {
	const readFromTemp = (size) => {
		db.all(`
			SELECT *
			FROM stopovers
			ORDER BY trip_id ASC, sequence ASC
			LIMIT ?
		`, size, (err, stopovers) => {
			if (err) {
				src.emit('error', err)
				return null
			}
			for (let stopover of stopovers) src.push(stopover)
		})
	}
	const src = new Readable({
		highWaterMark: 50,
		objectMode: true,
		read: readFromTemp
	})

	const writeIntoReal = () => {
		// todo
	}
	const dest = new Writable({
		highWaterMark: 50,
		objectMode: true,
		read: writeIntoReal
	})

	return new Promise((resolve, reject) => {
		pump(src, dest, (err) => {
			if (err) reject(err)
			else resolve()
		})
	})
}

module.exports = importIntoRealDb
