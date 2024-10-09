import { MAX_ASYNC_REQUESTS_COUNT } from '../constants';

type Task<T> = () => Promise<T>;

// Better to use redis-based or database queues in production
export class TaskQueue {
  private static instance: TaskQueue;
  private readonly limit: number;
  private queue: Array<Task<unknown>>;
  private running: number;

  private constructor(limit: number) {
    this.limit = limit;
    this.queue = [];
    this.running = 0;
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
  async execute<T>(task: Task<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const executeTask = async () => {
        try {
          this.running++;
          const result = await task();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.running--;
          this.runNext();
        }
      };

      if (this.running < this.limit) {
        executeTask();
      } else {
        this.queue.push(executeTask);
      }
    });
  }

  private runNext() {
    if (this.queue.length > 0 && this.running < this.limit) {
      const nextTask = this.queue.shift();
      if (nextTask) {
        nextTask();
      }
    }
  }
}
