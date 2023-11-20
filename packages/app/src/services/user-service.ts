import { IDatabase, Service } from 'ijon';

export class UserService extends Service {
  constructor(db: IDatabase) {
    super(db, 'users');
  }

  public async createUser(names: string[]) {
    return this.create(names);
  }

  public async getUser(id: number) {
    return this.find(id);
  }

  public async getUsers() {
    return this.all();
  }
}
