'use strict'

const hasProp = (o, k) => Object.prototype.hasOwnProperty.call(o, k)

const createTable = (db, name, columns, cb) => {
	const parts = []
	for (let column in columns) {
		if (!hasProp(columns, column)) continue

		const type = columns[column]
		// todo: sanitize
		parts.push(column + ' ' + type)
	}

	// todo: sanitize name
	const sql = `CREATE TABLE ${name} (${parts.join(', ')})`
	db.run(sql, cb)
}

module.exports = createTable
