'use strict'

const path = require('path')
const readCsv = require('gtfs-utils/read-csv')

const dir = process.env.SAMPLE_FEED === 'true'
	? path.dirname(require.resolve('sample-gtfs-feed/gtfs/routes.txt'))
	: __dirname
console.error('data dir', dir) // todo: remove

const readData = file => readCsv(path.join(dir, file))

module.exports = readData
