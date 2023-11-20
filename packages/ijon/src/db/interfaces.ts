export interface IDatabase {
  get(sql: string, params: any[]): Promise<any>;
  all(sql: string, params: any[]): Promise<any>;
  run(sql: string, params: any[]): Promise<void>;
  close(): Promise<void>;
}
