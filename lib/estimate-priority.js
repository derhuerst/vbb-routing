'use strict'

const estimatePriority = (segment, cfg) => {
	// 0 means "most promising"
	return (
		segment.totalDuration / cfg.maxDuration
		// todo: gps distance
	)
}

module.exports = estimatePriority
