'use strict'

const addTaskWithPriority = (queue, priority, task) => {
	if (!queue) throw new Error('missing queue.')
	if ('number' !== typeof priority) throw new Error('priority must be a number.')
	if ('function' !== typeof task) throw new Error('task must be a function.')

	let i
	for (i = 0; i < queue.jobs.length; i++) {
		if (priority < queue.jobs[i].priority) break
	}

	task.priority = priority
	queue.splice(i, 0, task)
	return i
}

module.exports = addTaskWithPriority
