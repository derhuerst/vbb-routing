'use strict'

const {inspect} = require('util')

const computeJourneys = require('.')

const search = computeJourneys('center', 'airport', 1554307600)

search.once('end', (err) => {
	if (!err) return null
	console.error(err)
	process.exitCode = 1
})
search.once('result', (journey) => {
	console.log(inspect(journey, {depth: Infinity}))
})
