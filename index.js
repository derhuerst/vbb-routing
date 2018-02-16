'use strict'

const path = require('path')
const {Database} = require('sqlite3')

const find = require('./lib/find')

const db = new Database(path.join(__dirname, 'index.sqlite'))

const computeJourneys = (origin, destination, start, cfg = {}) => {
	return find(db, origin, destination, start, cfg)
}

module.exports = computeJourneys
