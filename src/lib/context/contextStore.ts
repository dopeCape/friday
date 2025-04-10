import type { RequestContext } from "@/types";
import { AsyncLocalStorage } from "node:async_hooks";

/**
 * @class ContextStore
 * @description
 * A singleton class that manages request contexts using AsyncLocalStorage.
 * Provides methods to get and run code with request context.
 */
export class ContextStore {
  /**
   * @private
   * Singleton instance of the ContextStore
   */
  private static instance: ContextStore;

  /**
   * @private
   * AsyncLocalStorage instance to store request context
   */
  private storage: AsyncLocalStorage<RequestContext>;

  /**
   * @private
   * Private constructor to enforce singleton pattern
   * Initializes AsyncLocalStorage instance
   */
  private constructor() {
    this.storage = new AsyncLocalStorage<RequestContext>();
  }

  /**
   * @static
   * @returns {ContextStore} The singleton instance of ContextStore
   * @description Gets or creates the singleton instance of ContextStore
   */
  public static getInstance(): ContextStore {
    if (!this.instance) {
      this.instance = new ContextStore();
    }
    return this.instance;
  }

  /**
   * @returns {RequestContext | undefined} The current request context or undefined if none exists
   * @description Retrieves the current request context from storage
   */
  getContext(): RequestContext | undefined {
    return this.storage.getStore();
  }

  /**
   * @param {RequestContext} context - The request context to run the function with
   * @param {Function} fn - The function to execute within the context
   * @returns {T} The result of the executed function
   * @description Executes a function with a specific request context
   * @template T - The return type of the function
   */
  runWithContext<T>(context: RequestContext, fn: () => T): T {
    return this.storage.run(context, fn);
  }
}
