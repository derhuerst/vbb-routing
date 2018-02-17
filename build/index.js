'use strict'

const path = require('path')
const {Database} = require('sqlite3')

const createDb = require('./create-db')
const importToTempDb = require('./import-to-temp-db')
const importIntoRealDb = require('./import-into-real-db')

const db = new Database(path.join(__dirname, '..', 'data.sqlite'))

const {
	db: tempDb,
	closeAndDelete: closeAndDeleteTempDb
} = createDb('temp.sqlite')

importToTempDb(tempDb)
importIntoRealDb(db)
.then(() => new Promise((resolve, reject) => {
	closeAndDeleteTempDb((err) => {
		if (err) return reject(err)
		db.close((err) => {
			if (err) reject(err)
			else resolve()
		})
	})
}))
.catch((err) => {
	console.error(err)
	process.exitCode = 1
})
