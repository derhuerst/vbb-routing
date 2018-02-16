'use strict'

const createFindSegments = (db, cfg) => {
	// todo: use db.prepare for perf
	const results = cfg.resultsPerStep
	const latestArrival = cfg.start + cfg.maxDuration

	const findSegments = (prev, cb) => {
		let blacklistSql = ''
		for (let where in prev.blacklist) {
			blacklistSql += `
				AND b != ?`
		}

		const args = [
			prev.where, // a
			prev.route || '_', prev.when, // earliest departure with same route
			prev.when + cfg.transferTime, // earliest departure with different route
			latestArrival
		]
		const sql = `\
			SELECT b, timestamp, duration, route_id
			FROM edges
			WHERE (
				a = ?
				AND (
					(route_id = ? AND timestamp >= ?)
					OR timestamp >= ?
				)
				AND (timestamp + duration) <= ?
				${blacklistSql}
			)
			LIMIT ?`
		// todo: sort by duration

		db.all(sql, ...args, ...prev.blacklist, results, (err, edges) => {
			if (err) return cb(err)

			const segments = []
			for (let edge of edges) {
				const isTransfer = edge.route_id !== prev.route
				const blacklist = Array.from(prev.blacklist)
				if (!blacklist.includes(edge.b)) blacklist.push(edge.b)

				segments.push({
					where: edge.b,
					when: edge.timestamp + edge.duration,
					route: edge.route_id,
					duration: edge.duration,
					totalDuration: edge.duration + prev.totalDuration,
					transfers: prev.transfers + (isTransfer ? 1 : 0),
					blacklist,
					previousSegment: prev
				})
			}

			cb(null, segments)
		})
	}
	return findSegments
}

module.exports = createFindSegments
