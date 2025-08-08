class Semaphore {
    capacityLeft: number;
    queue: Array<any>;

    /**
     * @description Creates a new semaphore with the given capacity.
     * @example
     * const semaphore = new Semaphore(1);
     * await semaphore.down();
     * // Do something
     * await semaphore.up();
     * @param capacity - The number of concurrent operations allowed.
     */
    constructor(capacity: number) {
        this.capacityLeft = capacity;
        this.queue = [];
    }

    /**
     * @description Waits for the semaphore to be available.
     */
    down() {
        if (this.capacityLeft > 0) {
            this.capacityLeft--;
            return;
        }

        return new Promise<void>((resolve) => {
            this.queue.push(resolve)
        });
    }

    /**
     * @description Releases the semaphore. Upping the semaphore more times than it was downed
     * is expected to be handled by the caller, we intentionally do not throw an error in this case.
     */
    up() {
        if (this.queue.length === 0) {
            // No one is waiting, so we can return the capacity spot!
            this.capacityLeft++;
            return;
        }

        // Otherwise, take someone off the queue, they will take the capacity off so no point in modifying it
        const next = this.queue.shift();
        next();
    }
}

export default Semaphore;