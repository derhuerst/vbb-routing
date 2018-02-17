'use strict'

const path = require('path')
const {Database} = require('sqlite3')
const fs = require('fs')

const createDb = (name) => {
	const file = path.join(__dirname, name)
	const db = new Database(file)

	const closeAndDelete = (cb) => {
		db.close((err) => {
			if (err) cb(err)
			else fs.unlink(file, cb)
		})
	}

	return {db, closeAndDelete}
}

module.exports = createDb
