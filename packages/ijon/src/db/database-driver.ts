import { DatabaseConfig } from './interfaces.js';

export abstract class DatabaseDriver<T extends DatabaseConfig> {
  protected config: T;

  constructor(config: T) {
    this.config = config; 
  }

  abstract connect(): Promise<void>;

  abstract disconnect(): Promise<void>;
}
