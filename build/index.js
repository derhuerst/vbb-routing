'use strict'

const path = require('path')
const {Database} = require('sqlite3')

const computeSegments = require('./compute-segments')
const importSegments = require('./import-segments')

const db = new Database(path.join(__dirname, '..', 'index.sqlite'))

computeSegments()
.then(segments => importSegments(db, segments))
.then(() => {
	return new Promise((resolve, reject) => {
		db.close((err) => {
			if (err) reject(err)
			else resolve()
		})
	})
})
.catch((err) => {
	console.error(err)
	process.exit(1)
})
