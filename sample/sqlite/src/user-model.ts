import { Model } from '@kurdel/core/db';

export class UserModel extends Model {
  table = 'users';

  public async createUser(name: string, role: string) {
    return this.create({ id: null, name, role });
  }

  public async getUser(id: number) {
    return this.find('id', [id]);
  }

  public async getUsers() {
    return this.findAll();
  }
}
