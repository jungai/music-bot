export class Queue {
	queue = [];

	constructor() {}

	enqueue(item) {
		this.queue.push(item);
	}

	dequeue() {
		this.queue.shift();
	}

	front() {
		return this.queue[0];
	}

	current() {
		return this.queue;
	}

	size() {
		return this.queue.length;
	}

	clear() {
		this.queue = [];
	}

	isEmpty() {
		return this.queue.length === 0;
	}
}

export default Queue;
