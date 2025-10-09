import type { Newable } from '@kurdel/common';
import type { Identifier } from '@kurdel/ioc';
import type { IDatabase, IQueryBuilder} from '@kurdel/db';
import { QueryBuilder } from '@kurdel/db';

interface ModelDeps {
  db: IDatabase;
}

export abstract class Model {
  private db: IDatabase;
  private builder: IQueryBuilder;
  protected abstract table: string;

  constructor(deps: ModelDeps) {
    this.db = deps.db;
    this.builder = new QueryBuilder();
  }

  public async create(data: Record<string, any>) {
    return this.db.run(this.builder.insert(this.table, data).build());
  }

  public async find(field: string, values: any[]) {
    return this.db.get(
      this.builder.select('*').from(this.table).where(`${field} = ?`, values).build()
    );
  }

  public async findAll() {
    return this.db.all(this.builder.select('*').from(this.table).build());
  }
}

export interface ModelConfig {
  /** Controller class */
  use: Newable<Model>;

  /** Dependencies to be injected from IoC */
  deps?: Record<string, Identifier>;
}

export type ModelList = (Newable<Model> | ModelConfig)[];
