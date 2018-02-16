'use strict'

const createFindSegments = (db, results, maxArr) => {
	const findSegments = (prev, cb) => {
		const a = prev.where
		const minDep = prev.when

		let sql = `\
			SELECT b, timestamp, duration, route_id
			FROM edges
			WHERE (
				a = ?
				AND timestamp >= ?
				AND (timestamp + duration) <= ?`
		for (let where in prev.blacklist) {
			sql += `
				AND b != ?`
		}
		sql += `\
			)
			LIMIT ?`

		console.error(sql)
		console.error('a', a)
		console.error('minDep', new Date(minDep * 1000).toTimeString())
		console.error('maxArr', new Date(maxArr * 1000).toTimeString())
		console.error('blacklist', prev.blacklist)
		console.error('\n')

		db.all(sql, a, minDep, maxArr, ...prev.blacklist, results, (err, edges) => {
			if (err) return cb(err)

			const segments = []
			for (let edge of edges) {
				const blacklist = Array.from(prev.blacklist)
				if (!blacklist.includes(edge.b)) blacklist.push(edge.b)
				segments.push({
					prev,
					where: edge.b,
					duration: edge.duration,
					when: edge.timestamp + edge.duration,
					totalDuration: edge.duration + prev.totalDuration,
					route: edge.route_id,
					blacklist
				})
			}

			cb(null, segments)
		})
	}
	return findSegments
}

module.exports = createFindSegments
