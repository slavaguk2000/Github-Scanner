import { MAX_ASYNC_REQUESTS_COUNT } from '../constants';
import PQueue, { QueueAddOptions } from 'p-queue';
import PriorityQueue from 'p-queue/dist/priority-queue';

type Task<T> = () => Promise<T>;

// Better to use redis-based or database queues in production
export class TaskQueue {
  private static instance: TaskQueue;
  private queue: PQueue<PriorityQueue, QueueAddOptions>;

  private constructor(limit: number) {
    this.queue = new PQueue({ concurrency: limit });
  }

  public static getInstance() {
    if (!TaskQueue.instance) {
      TaskQueue.instance = new TaskQueue(MAX_ASYNC_REQUESTS_COUNT);
    }

    return TaskQueue.instance;
  }

  /**
   * Enqueues and executes asynchronous tasks up to a specified concurrency limit.
   * Tasks are executed sequentially if they exceed the limit.
   *
   * @template T
   * @param {Task<T>} task - A function representing the task to execute.
   * @returns {Promise<T>} - The result of the task once executed.
   */
  execute<T>(task: Task<T>): Promise<T> {
    return this.queue.add(task) as Promise<T>;
  }
}
