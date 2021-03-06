'use strict'

const estimatePriority = (segment, cfg) => {
	// 0 means "most promising"
	return (
		segment.transfers / 3 +
		(segment.when - cfg.start) / cfg.maxDuration
		// todo: gps distance
	)
}

module.exports = estimatePriority
