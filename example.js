'use strict'

const path = require('path')
const {Database} = require('sqlite3')
const {inspect} = require('util')

const find = require('.')

const db = new Database(path.join(__dirname, 'index.sqlite'))

const search = find(db, 'center', 'airport', 1554307600)
search.once('end', (err) => {
	if (!err) return null
	console.error(err)
	process.exitCode = 1
})
search.once('result', (journey) => {
	console.log(inspect(journey, {depth: Infinity}))
})
